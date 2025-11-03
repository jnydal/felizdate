ALTER TABLE userprofile ADD COLUMN havechildren boolean;
UPDATE userprofile set havechildren = false;

