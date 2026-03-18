'use client'

import Image from 'next/image'

interface AvatarProps {
  imageUrl?: string | null
  firstName: string
  lastName: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showHoverEffect?: boolean
}

// Generate a consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ]

  // Generate a hash from the name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

export function Avatar({
  imageUrl,
  firstName,
  lastName,
  size = 'md',
  className = '',
  showHoverEffect = false,
}: AvatarProps) {
  const fullName = `${firstName} ${lastName}`
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const bgColor = getAvatarColor(fullName)
  const imageSize = imageSizes[size]

  const hoverClasses = showHoverEffect
    ? 'transition-transform duration-200 group-hover:scale-[2.5] group-hover:z-50 group-hover:shadow-xl group-hover:rounded-xl'
    : ''

  if (imageUrl) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${hoverClasses} ${className}`}>
        <Image
          src={imageUrl}
          alt={fullName}
          width={imageSize}
          height={imageSize}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${hoverClasses} ${className}`}
      title={fullName}
    >
      {initials}
    </div>
  )
}

// Compress and resize image before upload
// Using 400x400 at 90% quality for good balance of size and quality
async function compressImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.9): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }
          // Create new file with same name but .jpg extension
          const newFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
          })
          resolve(newFile)
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Editable avatar with upload button overlay
interface EditableAvatarProps extends AvatarProps {
  onImageChange?: (file: File) => void
  isUploading?: boolean
}

export function EditableAvatar({
  imageUrl,
  firstName,
  lastName,
  size = 'lg',
  className = '',
  onImageChange,
  isUploading = false,
}: EditableAvatarProps) {
  const fullName = `${firstName} ${lastName}`
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const bgColor = getAvatarColor(fullName)
  const imageSize = imageSizes[size]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageChange) {
      try {
        // Compress image to max 400x400, 90% quality for good balance
        const compressed = await compressImage(file, 400, 400, 0.9)
        onImageChange(compressed)
      } catch (error) {
        console.error('Failed to compress image:', error)
        // Fall back to original file
        onImageChange(file)
      }
    }
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {imageUrl ? (
        <div className="w-full h-full rounded-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={fullName}
            width={imageSize}
            height={imageSize}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div
          className={`w-full h-full ${bgColor} rounded-full flex items-center justify-center text-white font-semibold`}
          title={fullName}
        >
          {initials}
        </div>
      )}

      {/* Upload overlay */}
      {onImageChange && (
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </label>
      )}
    </div>
  )
}
