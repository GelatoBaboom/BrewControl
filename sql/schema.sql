CREATE DATABASE  IF NOT EXISTS `brewcontrol` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `brewcontrol`;
-- MySQL dump 10.13  Distrib 5.6.23, for Win64 (x86_64)
--
-- Host: 192.168.1.155    Database: brewcontrol
-- ------------------------------------------------------
-- Server version	5.5.54-0+deb8u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas`
--

DROP TABLE IF EXISTS `alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alertas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(5) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bancofrio`
--

DROP TABLE IF EXISTS `bancofrio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bancofrio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(5) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `temperatura` decimal(3,1) DEFAULT '0.0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configs`
--

DROP TABLE IF EXISTS `configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comport` varchar(100) DEFAULT 'COM3',
  `refritemp` decimal(3,1) DEFAULT '1.0',
  `tolerancia` decimal(3,1) DEFAULT '0.0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fermentadores`
--

DROP TABLE IF EXISTS `fermentadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fermentadores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile` int(11) DEFAULT NULL,
  `tanque` int(11) DEFAULT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `notas` text,
  `alerta` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mapatemp`
--

DROP TABLE IF EXISTS `mapatemp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mapatemp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tempFrom` int(11) DEFAULT NULL,
  `tempTo` int(11) DEFAULT NULL,
  `temp` decimal(3,1) DEFAULT NULL,
  `tolerancia` decimal(3,1) DEFAULT NULL,
  `profile` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_profile` (`profile`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `duration` int(11) DEFAULT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registrotemp`
--

DROP TABLE IF EXISTS `registrotemp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `registrotemp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fermentador` int(11) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `temp_reg` decimal(3,1) DEFAULT NULL,
  `temp_prog` decimal(3,1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_fermentador` (`fermentador`)
) ENGINE=InnoDB AUTO_INCREMENT=105883 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tanques`
--

DROP TABLE IF EXISTS `tanques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tanques` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(5) DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `temp_calibration` decimal(3,1) DEFAULT '0.0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-27 20:09:44
