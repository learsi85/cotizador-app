-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-10-2025 a las 22:16:07
-- Versión del servidor: 10.1.37-MariaDB
-- Versión de PHP: 7.2.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cotizaciones_db`
--
-- CREATE DATABASE IF NOT EXISTS `cotizaciones_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `cotizaciones_db`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rfc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `contacto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `clientes`:
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_smtp`
--

CREATE TABLE `configuracion_smtp` (
  `id` int(11) NOT NULL,
  `empresa_id` int(11) NOT NULL,
  `host` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `puerto` int(11) NOT NULL DEFAULT '587',
  `usuario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remitente` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usar_ssl` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `configuracion_smtp`:
--   `empresa_id`
--       `empresas` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `correos`
--

CREATE TABLE `correos` (
  `id` int(11) NOT NULL,
  `cotizacion_id` int(11) DEFAULT NULL,
  `destinatario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asunto` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `enviado` tinyint(1) DEFAULT '0',
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `message_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `correos`:
--   `cotizacion_id`
--       `cotizaciones` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizaciones`
--

CREATE TABLE `cotizaciones` (
  `id` int(11) NOT NULL,
  `folio` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `cliente_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `margen_porcentaje` decimal(5,2) NOT NULL,
  `ganancia` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('borrador','enviada','aceptada','rechazada','vencida') COLLATE utf8mb4_unicode_ci DEFAULT 'borrador',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `cotizaciones`:
--   `cliente_id`
--       `clientes` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_items`
--

CREATE TABLE `cotizacion_items` (
  `id` int(11) NOT NULL,
  `cotizacion_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `cantidad` int(11) NOT NULL,
  `precio_costo` decimal(10,2) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `proveedor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `cotizacion_items`:
--   `cotizacion_id`
--       `cotizaciones` -> `id`
--   `producto_id`
--       `productos` -> `id`
--

--
-- Disparadores `cotizacion_items`
--
DELIMITER $$
CREATE TRIGGER `actualizar_stock_cotizacion` AFTER INSERT ON `cotizacion_items` FOR EACH ROW BEGIN
    UPDATE productos 
    SET stock = stock - NEW.cantidad 
    WHERE id = NEW.producto_id AND stock >= NEW.cantidad;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` text COLLATE utf8mb4_unicode_ci,
  `rfc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condiciones_pago` text COLLATE utf8mb4_unicode_ci,
  `condiciones_entrega` text COLLATE utf8mb4_unicode_ci,
  `vigencia_cotizacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '15 días',
  `notas_adicionales` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `empresas`:
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `cotizacion_id` int(11) DEFAULT NULL,
  `tipo` enum('reunion','seguimiento','entrega','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'otro',
  `completado` tinyint(1) DEFAULT '0',
  `recordatorio` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `eventos`:
--   `cliente_id`
--       `clientes` -> `id`
--   `cotizacion_id`
--       `cotizaciones` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_precios`
--

CREATE TABLE `historial_precios` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `precio_anterior` decimal(10,2) NOT NULL,
  `precio_nuevo` decimal(10,2) NOT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `historial_precios`:
--   `producto_id`
--       `productos` -> `id`
--   `usuario_id`
--       `usuarios` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio` decimal(10,2) NOT NULL,
  `proveedor_id` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `productos`:
--   `proveedor_id`
--       `proveedores` -> `id`
--

--
-- Disparadores `productos`
--
DELIMITER $$
CREATE TRIGGER `historial_precio_update` BEFORE UPDATE ON `productos` FOR EACH ROW BEGIN
    IF NEW.precio != OLD.precio THEN
        INSERT INTO historial_precios (producto_id, precio_anterior, precio_nuevo)
        VALUES (OLD.id, OLD.precio, NEW.precio);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `proveedores`:
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('admin','vendedor','contador') COLLATE utf8mb4_unicode_ci DEFAULT 'vendedor',
  `activo` tinyint(1) DEFAULT '1',
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `usuarios`:
--

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_cotizaciones_mensuales`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_cotizaciones_mensuales` (
`mes` varchar(7)
,`total_cotizaciones` bigint(21)
,`total_ventas` decimal(32,2)
,`total_ganancia` decimal(32,2)
,`margen_promedio` decimal(9,6)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_mejores_clientes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_mejores_clientes` (
`id` int(11)
,`nombre` varchar(255)
,`email` varchar(100)
,`total_cotizaciones` bigint(21)
,`monto_total` decimal(32,2)
,`ultima_cotizacion` date
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_productos_populares`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_productos_populares` (
`id` int(11)
,`sku` varchar(100)
,`nombre` varchar(500)
,`veces_cotizado` bigint(21)
,`cantidad_total` decimal(32,0)
,`venta_total` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_cotizaciones_mensuales`
--
DROP TABLE IF EXISTS `v_cotizaciones_mensuales`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_cotizaciones_mensuales`  AS  select date_format(`cotizaciones`.`fecha`,'%Y-%m') AS `mes`,count(0) AS `total_cotizaciones`,sum(`cotizaciones`.`total`) AS `total_ventas`,sum(`cotizaciones`.`ganancia`) AS `total_ganancia`,avg(`cotizaciones`.`margen_porcentaje`) AS `margen_promedio` from `cotizaciones` group by date_format(`cotizaciones`.`fecha`,'%Y-%m') order by date_format(`cotizaciones`.`fecha`,'%Y-%m') desc ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_mejores_clientes`
--
DROP TABLE IF EXISTS `v_mejores_clientes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_mejores_clientes`  AS  select `cl`.`id` AS `id`,`cl`.`nombre` AS `nombre`,`cl`.`email` AS `email`,count(`c`.`id`) AS `total_cotizaciones`,sum(`c`.`total`) AS `monto_total`,max(`c`.`fecha`) AS `ultima_cotizacion` from (`clientes` `cl` left join `cotizaciones` `c` on((`cl`.`id` = `c`.`cliente_id`))) group by `cl`.`id`,`cl`.`nombre`,`cl`.`email` order by sum(`c`.`total`) desc ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_productos_populares`
--
DROP TABLE IF EXISTS `v_productos_populares`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_productos_populares`  AS  select `p`.`id` AS `id`,`p`.`sku` AS `sku`,`p`.`nombre` AS `nombre`,count(`ci`.`id`) AS `veces_cotizado`,sum(`ci`.`cantidad`) AS `cantidad_total`,sum(`ci`.`subtotal`) AS `venta_total` from (`productos` `p` left join `cotizacion_items` `ci` on((`p`.`id` = `ci`.`producto_id`))) group by `p`.`id`,`p`.`sku`,`p`.`nombre` order by count(`ci`.`id`) desc ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre`(191)),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `configuracion_smtp`
--
ALTER TABLE `configuracion_smtp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `empresa_id` (`empresa_id`);

--
-- Indices de la tabla `correos`
--
ALTER TABLE `correos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cotizacion` (`cotizacion_id`),
  ADD KEY `idx_destinatario` (`destinatario`(191)),
  ADD KEY `idx_enviado` (`enviado`);

--
-- Indices de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `folio` (`folio`),
  ADD KEY `idx_folio` (`folio`),
  ADD KEY `idx_cliente` (`cliente_id`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_cotizaciones_fecha_estado` (`fecha`,`estado`);

--
-- Indices de la tabla `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cotizacion` (`cotizacion_id`),
  ADD KEY `idx_producto` (`producto_id`),
  ADD KEY `idx_cotizacion_items_precio` (`cotizacion_id`,`precio_venta`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cotizacion_id` (`cotizacion_id`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_cliente` (`cliente_id`),
  ADD KEY `idx_completado` (`completado`),
  ADD KEY `idx_eventos_fecha_completado` (`fecha`,`completado`);

--
-- Indices de la tabla `historial_precios`
--
ALTER TABLE `historial_precios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_producto` (`producto_id`),
  ADD KEY `idx_fecha` (`fecha_cambio`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_nombre` (`nombre`(191)),
  ADD KEY `idx_proveedor` (`proveedor_id`),
  ADD KEY `idx_activo` (`activo`);
ALTER TABLE `productos` ADD FULLTEXT KEY `idx_busqueda` (`sku`,`nombre`,`descripcion`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre`(191)),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `configuracion_smtp`
--
ALTER TABLE `configuracion_smtp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `correos`
--
ALTER TABLE `correos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_precios`
--
ALTER TABLE `historial_precios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `configuracion_smtp`
--
ALTER TABLE `configuracion_smtp`
  ADD CONSTRAINT `configuracion_smtp_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `correos`
--
ALTER TABLE `correos`
  ADD CONSTRAINT `correos_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD CONSTRAINT `cotizaciones_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  ADD CONSTRAINT `cotizacion_items_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cotizacion_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `historial_precios`
--
ALTER TABLE `historial_precios`
  ADD CONSTRAINT `historial_precios_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_precios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
