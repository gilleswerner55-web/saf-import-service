import { pgTable, text, timestamp, integer, uuid, varchar, boolean, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const genderEnum = pgEnum('gender', ['men', 'women'])
export const armEnum = pgEnum('arm', ['left', 'right'])
export const tournamentTypeEnum = pgEnum('tournament_type', ['national', 'international', 'em', 'wm'])
export const tournamentStatusEnum = pgEnum('tournament_status', ['upcoming', 'completed'])
export const categoryTypeEnum = pgEnum('category_type', ['senior', 'junior', 'master', 'amateur'])
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin'])

// Clubs
export const clubs = pgTable('clubs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  shortName: varchar('short_name', { length: 50 }),
  location: varchar('location', { length: 255 }),
  logoUrl: text('logo_url'),
  presidentId: uuid('president_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Users (for admin authentication)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('admin'),
  clubId: uuid('club_id').references(() => clubs.id), // null for super_admin, set for club admins
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Members (Athletes)
export const members = pgTable('members', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: genderEnum('gender').notNull(),
  birthDate: timestamp('birth_date'), // Date of birth
  clubId: uuid('club_id').references(() => clubs.id),
  country: varchar('country', { length: 100 }).default('Switzerland'),
  imageUrl: text('image_url'), // Profile picture URL
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tournaments
export const tournaments = pgTable('tournaments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  location: varchar('location', { length: 255 }),
  type: tournamentTypeEnum('type').notNull().default('national'),
  status: tournamentStatusEnum('status').notNull().default('upcoming'),
  logoUrl: text('logo_url'),
  posterUrl: text('poster_url'),
  resultsUrl: text('results_url'), // PDF with tournament results
  participantCount: integer('participant_count'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tournament Categories
export const tournamentCategories = pgTable('tournament_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tournamentId: uuid('tournament_id').references(() => tournaments.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  gender: genderEnum('gender').notNull(),
  arm: armEnum('arm').notNull(),
  type: categoryTypeEnum('type').notNull().default('senior'),
  weightClass: varchar('weight_class', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tournament Results (Placements)
export const tournamentResults = pgTable('tournament_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => tournamentCategories.id).notNull(),
  memberId: uuid('member_id').references(() => members.id), // null if athlete not in members list
  athleteName: varchar('athlete_name', { length: 255 }).notNull(), // Original name from PDF
  country: varchar('country', { length: 100 }).notNull(),
  position: integer('position').notNull(),
  basePoints: integer('base_points').default(0),
  bonusPoints: integer('bonus_points').default(0),
  totalPoints: integer('total_points').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tournament Organizers (junction table for clubs organizing tournaments)
export const tournamentOrganizers = pgTable('tournament_organizers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tournamentId: uuid('tournament_id').references(() => tournaments.id, { onDelete: 'cascade' }).notNull(),
  clubId: uuid('club_id').references(() => clubs.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// SLP Rankings (calculated standings per season)
export const slpRankings = pgTable('slp_rankings', {
  id: uuid('id').defaultRandom().primaryKey(),
  season: varchar('season', { length: 20 }).notNull(), // e.g., "2025/26"
  memberId: uuid('member_id').references(() => members.id).notNull(),
  gender: genderEnum('gender').notNull(),
  totalPoints: integer('total_points').notNull().default(0),
  rank: integer('rank'),
  breakdown: text('breakdown'), // Points breakdown string e.g., "Best: Men 105 | L: 1st (15+2)=17 | R: 1st (15+2)=17"
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
})

// Types for insert/select
export type Club = typeof clubs.$inferSelect
export type NewClub = typeof clubs.$inferInsert

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert

export type Tournament = typeof tournaments.$inferSelect
export type NewTournament = typeof tournaments.$inferInsert

export type TournamentCategory = typeof tournamentCategories.$inferSelect
export type NewTournamentCategory = typeof tournamentCategories.$inferInsert

export type TournamentResult = typeof tournamentResults.$inferSelect
export type NewTournamentResult = typeof tournamentResults.$inferInsert

export type SLPRanking = typeof slpRankings.$inferSelect
export type NewSLPRanking = typeof slpRankings.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type TournamentOrganizer = typeof tournamentOrganizers.$inferSelect
export type NewTournamentOrganizer = typeof tournamentOrganizers.$inferInsert
