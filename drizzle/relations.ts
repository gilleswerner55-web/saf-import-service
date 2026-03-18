import { relations } from "drizzle-orm/relations";
import { members, slpRankings, tournaments, tournamentCategories, tournamentResults, clubs } from "./schema";

export const slpRankingsRelations = relations(slpRankings, ({one}) => ({
	member: one(members, {
		fields: [slpRankings.memberId],
		references: [members.id]
	}),
}));

export const membersRelations = relations(members, ({one, many}) => ({
	slpRankings: many(slpRankings),
	tournamentResults: many(tournamentResults),
	club: one(clubs, {
		fields: [members.clubId],
		references: [clubs.id]
	}),
}));

export const tournamentCategoriesRelations = relations(tournamentCategories, ({one, many}) => ({
	tournament: one(tournaments, {
		fields: [tournamentCategories.tournamentId],
		references: [tournaments.id]
	}),
	tournamentResults: many(tournamentResults),
}));

export const tournamentsRelations = relations(tournaments, ({many}) => ({
	tournamentCategories: many(tournamentCategories),
}));

export const tournamentResultsRelations = relations(tournamentResults, ({one}) => ({
	tournamentCategory: one(tournamentCategories, {
		fields: [tournamentResults.categoryId],
		references: [tournamentCategories.id]
	}),
	member: one(members, {
		fields: [tournamentResults.memberId],
		references: [members.id]
	}),
}));

export const clubsRelations = relations(clubs, ({many}) => ({
	members: many(members),
}));