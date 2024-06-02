-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2024 at 04:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cssecdv`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(255) UNSIGNED NOT NULL,
  `name` varchar(32) NOT NULL,
  `email` varchar(32) NOT NULL,
  `password` varchar(64) NOT NULL,
  `phoneNumber` varchar(14) NOT NULL,
  `photo` mediumblob NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phoneNumber`, `photo`, `isAdmin`) VALUES
(0, 'ADMIN', 'admin@gmail.com', '$2b$10$6vQ2CbQJt8CTMxrx7JgfwueJD0mS0zJJEuFFxI8R.uw2oiAHGVk0m', '09331607874', '', 1),
(1, 'test111', 'silc15.inc@gmail.com', '$2b$10$Q.krwnBnX/iUgSsIW0ufvejPld2f3QCmHmb3T1i7QQNOkONeJ22Ci', '12345ad', '', 0),
(2, 'test2', 'iverson@spiralytics.com', '$2b$10$tzY9Rd4qIbzqrfOySGx6h.PyMYcwlVCZqcasdhhFMmAIJ7037h/e.', '12345ad', '', 0),
(3, 'Sean Caoile', 'jimmy@spiralytics.com', '$2b$10$UnOw0lC6T6UTbpseaCXWsuhF8rE3fLpSZIC.zgmDLojJcWX7CfsSS', '1344', '', 0),
(4, 'Sean Caoile', 'seaniverson01@yahoo.com', '$2b$10$20.cBY0iU6q.WU06H3DJVuWSyMHxeUSRrgqoGF3om8nm/kkczy.12', '12345', '', 0),
(5, 'mergeTest', 'chaozerker01@gmail.com', '$2b$10$FaVKRyd.C7s6Z6Q0AI4Cqu.DXrkkJJRqb4byt6JFfBwsEWzZ25YVi', '09171677201', '', 0),
(8, 'afterAdmin', 'tes123t@gmail.com', '$2b$10$X3KS4ORJaSwCcyzFi/Oe2uj0XSTAieUOrfwOBB1Zgl2S.rBPdiKQ6', '09999999999', '', 0),
(9, 'trash', 'trash@gmail.com', '$2b$10$Z5GxcnI26WVkrid/bG6XoOLVWRtdhsDArPfYCDjJhLlCjIh/4OJCW', '09888888888', '', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(255) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
