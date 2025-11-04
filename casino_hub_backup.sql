-- MySQL dump 10.13  Distrib 9.3.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: casino_hub
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `game_plays`
--

DROP TABLE IF EXISTS `game_plays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_plays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  `played_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `game_plays_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `game_plays_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_plays`
--

LOCK TABLES `game_plays` WRITE;
/*!40000 ALTER TABLE `game_plays` DISABLE KEYS */;
INSERT INTO `game_plays` VALUES (1,11,1,'2025-09-02 15:57:35'),(2,11,3,'2025-09-02 15:57:48'),(3,11,6,'2025-09-02 15:57:52'),(4,11,5,'2025-09-02 16:01:41'),(5,11,5,'2025-09-02 16:01:42'),(6,11,5,'2025-09-02 16:01:43'),(7,11,5,'2025-09-02 16:01:43'),(8,11,5,'2025-09-02 16:01:53'),(9,11,5,'2025-09-02 16:01:54'),(10,11,5,'2025-09-02 16:01:55'),(11,11,5,'2025-09-02 16:01:56'),(12,11,2,'2025-09-02 16:02:04'),(13,11,2,'2025-09-02 16:02:12'),(14,11,4,'2025-09-02 16:16:58'),(15,11,4,'2025-09-02 16:17:00'),(16,11,4,'2025-09-02 16:17:02'),(17,11,4,'2025-09-02 16:17:04'),(18,11,1,'2025-09-02 16:17:19'),(19,11,3,'2025-09-02 16:17:30'),(20,11,7,'2025-09-02 16:17:41'),(21,11,2,'2025-09-02 16:18:00'),(22,11,6,'2025-09-02 16:18:38'),(23,11,5,'2025-09-02 16:18:49'),(24,11,4,'2025-09-02 16:19:04'),(25,11,4,'2025-09-02 16:19:13'),(26,11,1,'2025-09-02 16:28:19'),(27,11,7,'2025-09-09 15:15:59'),(28,11,7,'2025-09-09 15:16:08'),(29,15,7,'2025-09-29 10:56:51'),(30,17,1,'2025-09-30 11:14:51'),(31,17,7,'2025-09-30 11:14:58'),(32,11,1,'2025-10-16 07:24:45'),(33,11,6,'2025-10-16 07:24:58'),(34,11,7,'2025-10-16 07:25:13'),(35,11,4,'2025-10-16 07:25:43'),(36,11,4,'2025-10-16 07:25:46'),(37,11,4,'2025-10-16 07:25:48'),(38,11,4,'2025-10-16 07:25:58'),(39,15,7,'2025-10-16 07:39:17'),(40,15,7,'2025-10-16 07:39:25'),(41,15,7,'2025-10-16 07:39:33'),(42,15,7,'2025-10-16 07:39:40'),(43,15,7,'2025-10-16 07:39:49'),(44,15,7,'2025-10-16 07:41:14');
/*!40000 ALTER TABLE `game_plays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,'Slot'),(2,'Baccarat'),(3,'Blackjack'),(4,'HiLo'),(5,'Keno'),(6,'Progressive Slot'),(7,'Roulette');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favourites`
--

DROP TABLE IF EXISTS `user_favourites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favourites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `game_name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_game` (`user_id`,`game_name`),
  CONSTRAINT `fk_user_favourites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favourites`
--

LOCK TABLES `user_favourites` WRITE;
/*!40000 ALTER TABLE `user_favourites` DISABLE KEYS */;
INSERT INTO `user_favourites` VALUES (28,11,'Roulette','2025-08-31 14:28:38'),(44,11,'Royal Slots','2025-08-31 15:00:41'),(47,16,'Royal Slots','2025-08-31 19:42:40'),(49,16,'Blackjack','2025-08-31 21:46:49'),(50,17,'Royal Slots','2025-09-30 15:14:33'),(51,17,'Baccarat','2025-09-30 15:14:34'),(52,17,'Hi-Lo','2025-09-30 15:14:35'),(53,17,'Winner Slots','2025-09-30 15:14:36');
/*!40000 ALTER TABLE `user_favourites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT '',
  `password` varchar(255) NOT NULL,
  `balance` int NOT NULL DEFAULT '1000',
  `score` int NOT NULL DEFAULT '0',
  `level` int NOT NULL DEFAULT '1',
  `experience` int NOT NULL DEFAULT '0',
  `freeSpins` int NOT NULL DEFAULT '0',
  `lastActive` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_free_coins` datetime DEFAULT NULL,
  `last_cash_claim` datetime NOT NULL DEFAULT '1970-01-01 00:00:01',
  `last_wheel_spin` datetime NOT NULL DEFAULT '1970-01-01 00:00:01',
  `free_games` json DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,'limonadia','nadiamezini@gmail.com','','$2a$10$A2pQ/9LeHa2OjOWa3polru/VHChhI3RCatNQYpax/u4rpqTueFLzm',2067371628,0,1,0,0,'2025-08-26 00:12:30','2025-08-26 00:12:30',NULL,'2025-10-16 09:26:18','2025-10-16 09:26:21','[\"Mystery Game\"]',NULL,NULL),(15,'camilla','camilla@gmail.com','','$2a$10$SYi/aOrC.CDO6QGi1ABdg.FDYbMMIYl/dcvFH/9bcUKGNRwPqQvWK',840,0,1,0,0,NULL,'2025-08-31 15:19:27',NULL,'2025-10-16 09:38:20','2025-09-29 12:55:21','[\"Mystery Game\"]',NULL,NULL),(16,'tea','tea@gmail.com','','$2a$10$/0c7THo3sPPb760vnWOog.p0gbraSizoUfTU41XoDyDP3jZfFos3.',5170,0,1,0,0,NULL,'2025-08-31 19:41:53',NULL,'1970-01-01 00:00:01','1970-01-01 00:00:01',NULL,NULL,NULL),(17,'qwer','nadiamezin@gmail.com','','$2a$10$TtvaIl94TGrZ61GrTtpXiekokDRE7on5OltFomDFZLMk6C.BrJqK6',5045,0,1,0,0,NULL,'2025-09-09 19:40:45',NULL,'2025-09-26 16:14:21','2025-09-30 13:05:08','[]',NULL,NULL),(18,'sfsd','nadiameziaaa@gmail.com','','$2a$10$cvEPcJAa/6EJMwFdGcQeCuFfABmdQ.fHpYIky9lcqOyvMsvBaOR3G',5330,0,1,0,0,NULL,'2025-09-09 19:43:00',NULL,'2025-09-29 13:03:40','2025-09-30 13:21:31','[\"Mystery Game\"]',NULL,NULL),(19,'nadiamez@gmail.com','nadiamez@gmail.com','','$2a$10$E6Hb.E9hzImDOcPV7M/27Oi9910VwJXT6NkKZK8Hne9t21DbtzbEa',5025,0,1,0,0,NULL,'2025-09-29 15:04:46',NULL,'1970-01-01 00:00:01','2025-09-29 13:05:02','[]',NULL,NULL),(20,'nad','nadiame@gmail.com','','$2a$10$BJCPOdvrwVRvjl6qfTw5lODN8oIbDVM9e2rHG0mqs5gMTIKE.LmJ2',5300,0,1,0,0,NULL,'2025-09-29 15:10:39',NULL,'1970-01-01 00:00:01','2025-09-29 13:10:51','[]',NULL,NULL),(21,'naddd','nadiam@gmail.com','','$2a$10$SPQ.DhCnfmFi5FPXinpqhuzfr3fZTQPJEcsMM7hM667HcbGXJYYHe',5225,0,1,0,0,NULL,'2025-09-29 15:13:33',NULL,'2025-09-29 13:17:57','2025-09-29 13:13:44','[]',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-04 14:09:14
