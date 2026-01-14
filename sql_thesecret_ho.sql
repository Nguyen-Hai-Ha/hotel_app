-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table hotel.assets
CREATE TABLE IF NOT EXISTS `assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_service` timestamp NULL DEFAULT NULL,
  `id_room` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assets_id_room_foreign` (`id_room`),
  CONSTRAINT `assets_id_room_foreign` FOREIGN KEY (`id_room`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.assets: ~2 rows (approximately)
INSERT INTO `assets` (`id`, `name`, `status`, `last_service`, `id_room`, `created_at`, `updated_at`) VALUES
	(1, 'Television', 'functional', '2024-01-15 03:00:00', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, 'Air Conditioner', 'needs_repair', '2023-11-01 07:30:00', 3, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci,
  `id_user` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_id_user_foreign` (`id_user`),
  CONSTRAINT `audit_logs_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.audit_logs: ~2 rows (approximately)
INSERT INTO `audit_logs` (`id`, `action`, `detail`, `id_user`, `created_at`, `updated_at`) VALUES
	(1, 'user_login', 'Admin user logged in.', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, 'room_status_change', 'Room 101 status changed to occupied.', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `check_in` datetime NOT NULL,
  `check_out` datetime NOT NULL,
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `id_customer` bigint unsigned NOT NULL,
  `id_room` bigint unsigned NOT NULL,
  `id_user` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_id_customer_foreign` (`id_customer`),
  KEY `bookings_id_room_foreign` (`id_room`),
  KEY `bookings_id_user_foreign` (`id_user`),
  CONSTRAINT `bookings_id_customer_foreign` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_id_room_foreign` FOREIGN KEY (`id_room`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `bookings_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.bookings: ~0 rows (approximately)
INSERT INTO `bookings` (`id`, `check_in`, `check_out`, `created_by`, `status`, `id_customer`, `id_room`, `id_user`, `created_at`, `updated_at`) VALUES
	(1, '2024-09-01 14:00:00', '2024-09-05 11:00:00', 'admin', 'confirmed', 1, 1, 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.booking_guests
CREATE TABLE IF NOT EXISTS `booking_guests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dod` date DEFAULT NULL,
  `id_card` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_booking` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_guests_id_booking_foreign` (`id_booking`),
  CONSTRAINT `booking_guests_id_booking_foreign` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.booking_guests: ~2 rows (approximately)
INSERT INTO `booking_guests` (`id`, `guest_name`, `dod`, `id_card`, `id_booking`, `created_at`, `updated_at`) VALUES
	(1, 'Guest A', '1990-01-01', '123456789', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, 'Guest B', '1992-05-10', '987654321', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.booking_histories
CREATE TABLE IF NOT EXISTS `booking_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `old_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `new_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_booking` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_histories_id_booking_foreign` (`id_booking`),
  CONSTRAINT `booking_histories_id_booking_foreign` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.booking_histories: ~1 rows (approximately)
INSERT INTO `booking_histories` (`id`, `old_status`, `new_status`, `changed_by`, `changed_at`, `id_booking`, `created_at`, `updated_at`) VALUES
	(1, 'pending', 'confirmed', 'admin', '2024-08-30 03:00:00', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.booking_services
CREATE TABLE IF NOT EXISTS `booking_services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `unit_price` double(10,2) NOT NULL,
  `id_booking` bigint unsigned NOT NULL,
  `id_service` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_services_id_booking_foreign` (`id_booking`),
  KEY `booking_services_id_service_foreign` (`id_service`),
  CONSTRAINT `booking_services_id_booking_foreign` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `booking_services_id_service_foreign` FOREIGN KEY (`id_service`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.booking_services: ~2 rows (approximately)
INSERT INTO `booking_services` (`id`, `quantity`, `unit_price`, `id_booking`, `id_service`, `created_at`, `updated_at`) VALUES
	(1, 2, 15.00, 1, 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, 1, 25.00, 1, 2, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_loyalty` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customers_id_loyalty_foreign` (`id_loyalty`),
  CONSTRAINT `customers_id_loyalty_foreign` FOREIGN KEY (`id_loyalty`) REFERENCES `loyalty_programs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.customers: ~2 rows (approximately)
INSERT INTO `customers` (`id`, `name`, `email`, `address`, `phone`, `country`, `id_loyalty`, `created_at`, `updated_at`) VALUES
	(1, 'John Doe', 'john.doe@example.com', '123 Main St, Anytown', '123-456-7890', 'China', 1, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(2, 'Jane Smith', 'jane.smith@example.com', '456 Oak Ave, Somewhere', '098-765-4321', 'taiwan', 2, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(3, 'Peter Jones', 'peter.jones@example.com', '789 Pine Ln, Nowhere', '555-123-4567', 'Cambodia', NULL, '2025-09-10 23:43:10', '2025-09-10 23:43:10');

-- Dumping structure for table hotel.customer_notes
CREATE TABLE IF NOT EXISTS `customer_notes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `note` text COLLATE utf8mb4_unicode_ci,
  `id_customer` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_notes_id_customer_foreign` (`id_customer`),
  CONSTRAINT `customer_notes_id_customer_foreign` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.customer_notes: ~2 rows (approximately)
INSERT INTO `customer_notes` (`id`, `note`, `id_customer`, `created_at`, `updated_at`) VALUES
	(1, 'Guest prefers quiet rooms.', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, 'Requires early check-in for next visit.', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salary_base` decimal(12,2) NOT NULL,
  `id_position` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employees_email_unique` (`email`),
  KEY `employees_id_position_foreign` (`id_position`),
  CONSTRAINT `employees_id_position_foreign` FOREIGN KEY (`id_position`) REFERENCES `job_positions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.employees: ~2 rows (approximately)
INSERT INTO `employees` (`id`, `name`, `phone`, `email`, `salary_base`, `id_position`, `created_at`, `updated_at`) VALUES
	(1, 'Alice Wonderland', '111-222-3333', 'alice@example.com', 5000.00, 1, '2025-09-10 23:43:11', '2025-09-10 23:43:11'),
	(2, 'Bob The Builder', '444-555-6666', 'bob@example.com', 2500.00, 2, '2025-09-10 23:43:11', '2025-09-10 23:43:11');

-- Dumping structure for table hotel.invoices
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subtotal` double DEFAULT NULL,
  `discount_total` double DEFAULT NULL,
  `grand_total` double DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_booking` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoices_id_booking_foreign` (`id_booking`),
  CONSTRAINT `invoices_id_booking_foreign` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.invoices: ~1 rows (approximately)
INSERT INTO `invoices` (`id`, `subtotal`, `discount_total`, `grand_total`, `status`, `id_booking`, `created_at`, `updated_at`) VALUES
	(1, 100, 0, 107, 'paid', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.invoice_promotions
CREATE TABLE IF NOT EXISTS `invoice_promotions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `id_invoice` bigint unsigned NOT NULL,
  `id_promotion` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_promotions_id_invoice_foreign` (`id_invoice`),
  KEY `invoice_promotions_id_promotion_foreign` (`id_promotion`),
  CONSTRAINT `invoice_promotions_id_invoice_foreign` FOREIGN KEY (`id_invoice`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invoice_promotions_id_promotion_foreign` FOREIGN KEY (`id_promotion`) REFERENCES `promotions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.invoice_promotions: ~1 rows (approximately)
INSERT INTO `invoice_promotions` (`id`, `amount`, `id_invoice`, `id_promotion`, `created_at`, `updated_at`) VALUES
	(1, 20, 1, 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.invoice_taxes
CREATE TABLE IF NOT EXISTS `invoice_taxes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `id_invoice` bigint unsigned NOT NULL,
  `id_tax` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_taxes_id_invoice_foreign` (`id_invoice`),
  KEY `invoice_taxes_id_tax_foreign` (`id_tax`),
  CONSTRAINT `invoice_taxes_id_invoice_foreign` FOREIGN KEY (`id_invoice`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invoice_taxes_id_tax_foreign` FOREIGN KEY (`id_tax`) REFERENCES `taxes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.invoice_taxes: ~1 rows (approximately)
INSERT INTO `invoice_taxes` (`id`, `amount`, `id_invoice`, `id_tax`, `created_at`, `updated_at`) VALUES
	(1, 800, 1, 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.job_positions
CREATE TABLE IF NOT EXISTS `job_positions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.job_positions: ~2 rows (approximately)
INSERT INTO `job_positions` (`id`, `title`, `level`, `created_at`, `updated_at`) VALUES
	(1, 'Manager', 'Senior', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(2, 'Receptionist', 'Junior', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(3, 'Housekeeper', 'Entry', '2025-09-10 23:43:09', '2025-09-10 23:43:09');

-- Dumping structure for table hotel.loyalty_programs
CREATE TABLE IF NOT EXISTS `loyalty_programs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_rate` decimal(7,4) DEFAULT NULL,
  `expire_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.loyalty_programs: ~2 rows (approximately)
INSERT INTO `loyalty_programs` (`id`, `name`, `discount_rate`, `expire_date`, `created_at`, `updated_at`) VALUES
	(1, 'Bronze', 0.0500, '2025-12-31', '2025-09-10 23:43:08', '2025-09-10 23:43:08'),
	(2, 'Silver', 0.1000, '2025-12-31', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(3, 'Gold', 0.1500, '2025-12-31', '2025-09-10 23:43:09', '2025-09-10 23:43:09');

-- Dumping structure for table hotel.maintenance_requests
CREATE TABLE IF NOT EXISTS `maintenance_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `id_room` bigint unsigned NOT NULL,
  `id_asset` bigint unsigned DEFAULT NULL,
  `id_employee` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_requests_id_room_foreign` (`id_room`),
  KEY `maintenance_requests_id_asset_foreign` (`id_asset`),
  KEY `maintenance_requests_id_employee_foreign` (`id_employee`),
  CONSTRAINT `maintenance_requests_id_asset_foreign` FOREIGN KEY (`id_asset`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `maintenance_requests_id_employee_foreign` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `maintenance_requests_id_room_foreign` FOREIGN KEY (`id_room`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.maintenance_requests: ~2 rows (approximately)
INSERT INTO `maintenance_requests` (`id`, `issue`, `closed_at`, `id_room`, `id_asset`, `id_employee`, `created_at`, `updated_at`) VALUES
	(1, 'Air conditioner not cooling properly.', NULL, 4, 2, 2, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, 'Leaky faucet in bathroom.', '2024-08-15 03:00:00', 4, NULL, 2, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.migrations: ~0 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
	(2, '2025_08_20_235719_create_loyalty_programs_table', 1),
	(3, '2025_08_20_235724_create_room_types_table', 1),
	(4, '2025_08_20_235726_create_services_table', 1),
	(5, '2025_08_20_235728_create_job_positions_table', 1),
	(6, '2025_08_20_235729_create_roles_table', 1),
	(7, '2025_08_20_235731_create_promotions_table', 1),
	(8, '2025_08_20_235732_create_taxes_table', 1),
	(9, '2025_08_20_235845_create_customers_table', 1),
	(10, '2025_08_20_235848_create_rooms_table', 1),
	(11, '2025_08_20_235850_create_employees_table', 1),
	(12, '2025_08_20_235914_create_users_table', 1),
	(13, '2025_08_20_235953_create_room_status_logs_table', 1),
	(14, '2025_08_20_235957_create_assets_table', 1),
	(15, '2025_08_21_000017_create_bookings_table', 1),
	(16, '2025_08_21_000026_create_customer_notes_table', 1),
	(17, '2025_08_21_000027_create_maintenance_requests_table', 1),
	(18, '2025_08_21_000029_create_shifts_table', 1),
	(19, '2025_08_21_000030_create_invoices_table', 1),
	(20, '2025_08_21_000032_create_audit_logs_table', 1),
	(21, '2025_08_21_000134_create_booking_guests_table', 1),
	(22, '2025_08_21_000136_create_booking_services_table', 1),
	(23, '2025_08_21_000137_create_booking_histories_table', 1),
	(24, '2025_08_21_000138_create_invoice_taxes_table', 1),
	(25, '2025_08_21_000140_create_invoice_promotions_table', 1),
	(26, '2025_08_21_000141_create_payments_table', 1),
	(27, '2025_08_21_000143_create_payrolls_table', 1),
	(28, '2025_09_06_022311_create_pending_bookings_table', 1);

-- Dumping structure for table hotel.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` double(12,2) NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_invoice` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_id_invoice_foreign` (`id_invoice`),
  CONSTRAINT `payments_id_invoice_foreign` FOREIGN KEY (`id_invoice`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.payments: ~1 rows (approximately)
INSERT INTO `payments` (`id`, `method`, `paid_at`, `amount`, `status`, `id_invoice`, `created_at`, `updated_at`) VALUES
	(1, 'Credit Card', '2025-09-10 23:43:12', 107.00, 'completed', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.payrolls
CREATE TABLE IF NOT EXISTS `payrolls` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `month` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_salary` double(12,2) NOT NULL,
  `bonus` double(12,2) DEFAULT NULL,
  `deduction` double(12,2) DEFAULT NULL,
  `net_pay` double(12,2) NOT NULL,
  `id_employee` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payrolls_id_employee_foreign` (`id_employee`),
  CONSTRAINT `payrolls_id_employee_foreign` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.payrolls: ~1 rows (approximately)
INSERT INTO `payrolls` (`id`, `month`, `base_salary`, `bonus`, `deduction`, `net_pay`, `id_employee`, `created_at`, `updated_at`) VALUES
	(1, 'August 2024', 5000.00, 500.00, 100.00, 5400.00, 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.pending_bookings
CREATE TABLE IF NOT EXISTS `pending_bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `number_room` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_room` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_user` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discounttotal` decimal(10,2) NOT NULL,
  `grandtotal` decimal(10,2) NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checkin` date NOT NULL,
  `checkout` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.pending_bookings: ~0 rows (approximately)

-- Dumping structure for table hotel.personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.personal_access_tokens: ~0 rows (approximately)

-- Dumping structure for table hotel.promotions
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount` double NOT NULL,
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_to` timestamp NULL DEFAULT NULL,
  `min_amount` double DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `promotions_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.promotions: ~2 rows (approximately)
INSERT INTO `promotions` (`id`, `code`, `type`, `discount`, `valid_from`, `valid_to`, `min_amount`, `created_at`, `updated_at`) VALUES
	(1, 'SUMMER20', 'percentage', 0.2, '2024-05-31 17:00:00', '2024-08-31 16:59:59', 100, '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(2, 'FREEROOM', 'fixed', 50, '2024-06-30 17:00:00', '2024-09-30 16:59:59', 200, '2025-09-10 23:43:10', '2025-09-10 23:43:10');

-- Dumping structure for table hotel.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.roles: ~2 rows (approximately)
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Admin', 'Administrator with full access.', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(2, 'Employee', 'General hotel employee.', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(3, 'Guest', 'Registered guest user.', '2025-09-10 23:43:09', '2025-09-10 23:43:09');

-- Dumping structure for table hotel.rooms
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_room_type` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_room_number_unique` (`room_number`),
  KEY `rooms_id_room_type_foreign` (`id_room_type`),
  CONSTRAINT `rooms_id_room_type_foreign` FOREIGN KEY (`id_room_type`) REFERENCES `room_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.rooms: ~2 rows (approximately)
INSERT INTO `rooms` (`id`, `room_number`, `status`, `image`, `id_room_type`, `created_at`, `updated_at`) VALUES
	(1, '101', 'available', 'hotel1.jpg', 1, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(2, '102', 'available', 'hotel2.jpg', 1, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(3, '201', 'available', 'hotel3.jpg', 2, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(4, '301', 'available', 'hotel4.jpg', 3, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(5, '202', 'available', 'hotel4.jpg', 2, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(6, '203', 'available', 'hotel4.jpg', 2, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(7, '204', 'available', 'hotel4.jpg', 2, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(8, '103', 'available', 'hotel1.jpg', 1, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(9, '104', 'available', 'hotel1.jpg', 1, '2025-09-10 23:43:10', '2025-09-10 23:43:10'),
	(10, '302', 'available', 'hotel4.jpg', 3, '2025-09-10 23:43:11', '2025-09-10 23:43:11'),
	(11, '303', 'available', 'hotel4.jpg', 3, '2025-09-10 23:43:11', '2025-09-10 23:43:11'),
	(12, '304', 'available', 'hotel4.jpg', 3, '2025-09-10 23:43:11', '2025-09-10 23:43:11');

-- Dumping structure for table hotel.room_status_logs
CREATE TABLE IF NOT EXISTS `room_status_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `change_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_room` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_status_logs_id_room_foreign` (`id_room`),
  CONSTRAINT `room_status_logs_id_room_foreign` FOREIGN KEY (`id_room`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.room_status_logs: ~2 rows (approximately)
INSERT INTO `room_status_logs` (`id`, `change_status`, `note`, `status`, `id_room`, `created_at`, `updated_at`) VALUES
	(1, 'initial_setup', 'Room set to available after construction.', 'available', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, 'checked_in', 'Guest checked in.', 'occupied', 2, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.room_types
CREATE TABLE IF NOT EXISTS `room_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_price` double NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `feature` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.room_types: ~2 rows (approximately)
INSERT INTO `room_types` (`id`, `name`, `base_price`, `description`, `feature`, `created_at`, `updated_at`) VALUES
	(1, 'Standard Room', 100, 'A comfortable standard room.', '["King-size bed", "Free Wi-Fi", "Flat-screen TV", "Mini-bar", "Balcony", "Jacuzzi"]', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(2, 'Deluxe Room', 150, 'A spacious deluxe room with a view.', '["King-size bed", "Free Wi-Fi", "Flat-screen TV", "Mini-bar", "Balcony", "Jacuzzi"]', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(3, 'Suite', 250, 'A luxurious suite with separate living area.', '["King-size bed", "Free Wi-Fi", "Flat-screen TV", "Mini-bar", "Balcony", "Jacuzzi"]', '2025-09-10 23:43:09', '2025-09-10 23:43:09');

-- Dumping structure for table hotel.services
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.services: ~2 rows (approximately)
INSERT INTO `services` (`id`, `name`, `price`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Breakfast Buffet', 15, 'Daily breakfast buffet with a variety of options.', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(2, 'Airport Shuttle', 25, 'Convenient shuttle service to and from the airport.', '2025-09-10 23:43:09', '2025-09-10 23:43:09'),
	(3, 'Spa Treatment', 80, 'Relaxing spa and massage treatments.', '2025-09-10 23:43:09', '2025-09-10 23:43:09');

-- Dumping structure for table hotel.shifts
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `id_employee` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shifts_id_employee_foreign` (`id_employee`),
  CONSTRAINT `shifts_id_employee_foreign` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.shifts: ~2 rows (approximately)
INSERT INTO `shifts` (`id`, `start_time`, `end_time`, `note`, `id_employee`, `created_at`, `updated_at`) VALUES
	(1, '2024-08-20 08:00:00', '2024-08-20 16:00:00', 'Morning shift', 1, '2025-09-10 23:43:12', '2025-09-10 23:43:12'),
	(2, '2024-08-20 16:00:00', '2024-08-21 00:00:00', 'Evening shift', 2, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

-- Dumping structure for table hotel.taxes
CREATE TABLE IF NOT EXISTS `taxes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate` double NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.taxes: ~0 rows (approximately)
INSERT INTO `taxes` (`id`, `name`, `rate`, `created_at`, `updated_at`) VALUES
	(1, 'VAT', 8, '2025-09-10 23:43:10', '2025-09-10 23:43:10');

-- Dumping structure for table hotel.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `id_role` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_id_role_foreign` (`id_role`),
  CONSTRAINT `users_id_role_foreign` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hotel.users: ~3 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`, `email`, `phone`, `status`, `id_role`, `created_at`, `updated_at`) VALUES
	(1, 'admin', '$2y$12$mdlPcPgJwO/zeU5UMiAdH.Z2wnWl1lc.xdR2idrp0elw8npZuPVZe', 'adminTSH@gmail.com', '1234567890', 'active', 1, '2025-09-10 23:43:11', '2025-09-10 23:43:11'),
	(2, 'employee1', '$2y$12$rF4gSFNq86t1NFmXapq5hu.zt013xi.GJlSe6z9GyU5GvKvxBX20G', 'abc@gmail.com', '1234567890', 'active', 2, '2025-09-10 23:43:11', '2025-09-10 23:43:11'),
	(3, 'guest1', '$2y$12$lsMp.taF8llg3HHBmhyefOOEazXVvPunqOzc6GGZFUUfTOK.EZre.', 'xyz@gmail.com', '1234567890', 'active', 3, '2025-09-10 23:43:12', '2025-09-10 23:43:12');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
