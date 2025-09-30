-- migrate:up
ALTER TABLE games
ADD COLUMN fixed_game_id uuid REFERENCES fixed_games(id) ON DELETE
SET NULL;