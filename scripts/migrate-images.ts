/**
 * Migration script to upload existing athlete images to Vercel Blob
 * Run with: node --env-file=.env --import tsx scripts/migrate-images.ts
 */

import { put } from '@vercel/blob'
import { db, members } from '../src/db'
import { eq } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

const ATHLETES_DIR = path.join(process.cwd(), 'public/athletes')

async function migrateImages() {
  console.log('Starting image migration to Vercel Blob...\n')

  // Get all image files
  const files = fs.readdirSync(ATHLETES_DIR).filter(f =>
    f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.webp')
  )

  console.log(`Found ${files.length} images to migrate\n`)

  // Get all members
  const allMembers = await db.select().from(members)
  console.log(`Found ${allMembers.length} members in database\n`)

  for (const file of files) {
    const filePath = path.join(ATHLETES_DIR, file)
    const fileBuffer = fs.readFileSync(filePath)

    // Extract name from filename (e.g., "christian-kaeslin.jpg" -> "Christian Kaeslin")
    const nameFromFile = file
      .replace(/\.[^/.]+$/, '') // Remove extension
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    console.log(`Processing: ${file} -> "${nameFromFile}"`)

    // Try to find matching member
    const matchingMember = allMembers.find(m => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase()
      const fileNameLower = nameFromFile.toLowerCase()
      return fullName === fileNameLower ||
             `${m.lastName} ${m.firstName}`.toLowerCase() === fileNameLower
    })

    // Upload to Vercel Blob
    const blobPath = matchingMember
      ? `members/${matchingMember.id}.jpg`
      : `members/${file}`

    try {
      const blob = await put(blobPath, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'image/jpeg',
      })

      console.log(`  Uploaded to: ${blob.url}`)

      // Update member in database if found
      if (matchingMember) {
        await db
          .update(members)
          .set({ imageUrl: blob.url, updatedAt: new Date() })
          .where(eq(members.id, matchingMember.id))
        console.log(`  Updated member: ${matchingMember.firstName} ${matchingMember.lastName}`)
      } else {
        console.log(`  ⚠️  No matching member found for "${nameFromFile}"`)
      }
    } catch (error) {
      console.error(`  ❌ Failed to upload ${file}:`, error)
    }

    console.log('')
  }

  console.log('Migration complete!')
  process.exit(0)
}

migrateImages().catch(console.error)
