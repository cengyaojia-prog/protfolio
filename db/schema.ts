import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const projects = sqliteTable("portfolio_projects", {id:text("id").primaryKey(),data:text("data").notNull(),updatedAt:text("updated_at").notNull()});
export const settings = sqliteTable("portfolio_settings", {key:text("key").primaryKey(),data:text("data").notNull()});
export const uploads = sqliteTable("portfolio_uploads", {
 id:text("id").primaryKey(),ownerId:text("owner_id").notNull(),objectKey:text("object_key").notNull(),uploadId:text("upload_id").notNull(),contentType:text("content_type").notNull(),totalSize:integer("total_size").notNull(),filename:text("filename").notNull(),state:text("state").notNull().default("uploading"),createdAt:text("created_at").notNull()
});
