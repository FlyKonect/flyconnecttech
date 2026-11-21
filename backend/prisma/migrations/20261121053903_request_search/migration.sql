-- CreateIndex
CREATE FULLTEXT INDEX `support_requests_title_description_idx` ON `support_requests`(`title`, `description`);
