
DROP DATABASE if EXISTS `pushpa_rani_game`;
CREATE DATABASE IF NOT EXISTS `pushpa_rani_game`;
use `pushpa_rani_game`;

 CREATE TABLE IF NOT EXISTS `settlement`(
   `settlement_id` int NOT NULL AUTO_INCREMENT,
   `bet_id` varchar(255) DEFAULT NULL,
   `lobby_id` BIGINT DEFAULT NULL,
   `user_id` varchar(255) DEFAULT NULL,
   `operator_id` varchar(255) DEFAULT NULL,
   `name` varchar(255) DEFAULT NULL,
   `bet_amount` DECIMAL(10, 2) DEFAULT 0.00,
   `avatar` VARCHAR(255) NOT NULL,
   `balance` DECIMAL(10, 2) DEFAULT 0.00,
   `max_mult` DECIMAL(10, 2) DEFAULT 0.00,
   `status` varchar(255) DEFAULT "CRASHED",
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`settlement_id`)
 );

 CREATE TABLE IF NOT EXISTS `round_stats` (
   `id` int primary key  auto_increment,
   `lobby_id` BIGINT  NOT NULL,
   `start_time` BIGINT DEFAULT NULL,
   `max_mult` DECIMAL(10, 2) DEFAULT 0.00,
   `end_time` BIGINT DEFAULT NULL,
   `total_bets` INT DEFAULT NULL,
   `total_players` INT DEFAULT NULL,
   `total_bet_amount` DECIMAL(10, 2) DEFAULT 0.00,
   `total_cashout_amount` DECIMAL(10, 2) DEFAULT 0.00,
   `biggest_winner` DECIMAL(10, 2) DEFAULT 0.00,
   `biggest_looser` DECIMAL(10, 2) DEFAULT 0.00,
   `total_round_settled` DECIMAL(10, 2) DEFAULT 0.00,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
 );



CREATE TABLE IF NOT EXISTS `lobbies` (
   `id` int primary key  auto_increment,
   `lobby_id` BIGINT NOT NULL,
   `start_delay` INT NOT NULL,
   `end_delay` INT NOT NULL,
   `max_mult` DECIMAL(10, 2) DEFAULT 0.00,
   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 );


CREATE TABLE IF NOT EXISTS `bets` (
   `id` int primary key  auto_increment,
   `bet_id` varchar(255) NOT NULL,
   `lobby_id` BIGINT NOT NULL,
   `user_id` varchar(255) NOT NULL,
   `operator_id` varchar(255) DEFAULT NULL,
   `name` VARCHAR(45) NOT NULL,
   `bet_amount` DECIMAL(10, 2) DEFAULT 0.00,
   `avatar` VARCHAR(255) NULL ,
   `balance` DECIMAL(10, 2) DEFAULT 0.00,
   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
   `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 ); 

ALTER TABLE `bets` ADD INDEX `lobby_id_index` (`lobby_id` ASC)VISIBLE, ADD INDEX `operator_id_index` (`operator_id` ASC) VISIBLE, ADD INDEX `bet_amount_index` (`bet_amount` ASC) VISIBLE, ADD INDEX `created_at_index` (`created_at` ASC) VISIBLE;
ALTER TABLE `round_stats` ADD INDEX `lobby_id_index` (`lobby_id` ASC) VISIBLE, ADD INDEX `max_mult_index` (`max_mult` ASC) VISIBLE, ADD INDEX `created_at_index` (`created_at` ASC) VISIBLE;
ALTER TABLE `settlement` ADD INDEX `lobby_id_index` (`lobby_id` ASC) INVISIBLE,ADD INDEX `bet_amount_index` (`bet_amount` ASC) INVISIBLE, ADD INDEX `max_mult_index` (`max_mult` ASC) VISIBLE;


ALTER TABLE `bets` ADD COLUMN `auto_cashout` DECIMAL(10, 2) NULL DEFAULT NULL AFTER `bet_amount`;
ALTER TABLE `settlement` ADD COLUMN `auto_cashout` DECIMAL(10, 2) NULL DEFAULT NULL AFTER `bet_amount`;
