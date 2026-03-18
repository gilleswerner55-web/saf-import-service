import { pgTable, foreignKey, uuid, varchar, integer, timestamp, text, boolean, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const arm = pgEnum("arm", ['left', 'right'])
export const categoryType = pgEnum("category_type", ['senior', 'junior', 'master', 'amateur'])
export const gender = pgEnum("gender", ['men', 'women'])
export const tournamentStatus = pgEnum("tournament_status", ['upcoming', 'completed'])
export const tournamentType = pgEnum("tournament_type", ['national', 'international', 'em', 'wm'])


export const slpRankings = pgTable("slp_rankings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	season: varchar({ length: 20 }).notNull(),
	memberId: uuid("member_id").notNull(),
	gender: gender().notNull(),
	totalPoints: integer("total_points").default(0).notNull(),
	rank: integer(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		slpRankingsMemberIdMembersIdFk: foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "slp_rankings_member_id_members_id_fk"
		}),
	}
});

export const tournaments = pgTable("tournaments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	location: varchar({ length: 255 }),
	type: tournamentType().default('national').notNull(),
	status: tournamentStatus().default('upcoming').notNull(),
	logoUrl: text("logo_url"),
	posterUrl: text("poster_url"),
	participantCount: integer("participant_count"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tournamentCategories = pgTable("tournament_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tournamentId: uuid("tournament_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	gender: gender().notNull(),
	arm: arm().notNull(),
	type: categoryType().default('senior').notNull(),
	weightClass: varchar("weight_class", { length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		tournamentCategoriesTournamentIdTournamentsIdFk: foreignKey({
			columns: [table.tournamentId],
			foreignColumns: [tournaments.id],
			name: "tournament_categories_tournament_id_tournaments_id_fk"
		}),
	}
});

export const tournamentResults = pgTable("tournament_results", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	memberId: uuid("member_id"),
	athleteName: varchar("athlete_name", { length: 255 }).notNull(),
	country: varchar({ length: 100 }).notNull(),
	position: integer().notNull(),
	basePoints: integer("base_points").default(0),
	bonusPoints: integer("bonus_points").default(0),
	totalPoints: integer("total_points").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		tournamentResultsCategoryIdTournamentCategoriesIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [tournamentCategories.id],
			name: "tournament_results_category_id_tournament_categories_id_fk"
		}),
		tournamentResultsMemberIdMembersIdFk: foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "tournament_results_member_id_members_id_fk"
		}),
	}
});

export const members = pgTable("members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	gender: gender().notNull(),
	clubId: uuid("club_id"),
	country: varchar({ length: 100 }).default('Switzerland'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	imageUrl: text("image_url"),
}, (table) => {
	return {
		membersClubIdClubsIdFk: foreignKey({
			columns: [table.clubId],
			foreignColumns: [clubs.id],
			name: "members_club_id_clubs_id_fk"
		}),
	}
});

export const clubs = pgTable("clubs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	shortName: varchar("short_name", { length: 50 }),
	location: varchar({ length: 255 }),
	logoUrl: text("logo_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	presidentId: uuid("president_id"),
}, (table) => {
	return {
		clubsNameUnique: unique("clubs_name_unique").on(table.name),
	}
});
