-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "favoriteSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[];
