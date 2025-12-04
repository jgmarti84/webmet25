#!/usr/bin/env python3
"""
Genpro25 - Radar Data Processing and Product Generation Service

This service handles:
- BUFR file processing
- NetCDF product generation
- Radar image creation
"""
import asyncio
import logging
import os
from pathlib import Path

from radarlib import config
from radarlib.daemons import DaemonManager, DaemonManagerConfig


logger = logging.getLogger(__name__)


# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


def main():
    """
    Main entry point for the Genpro25 radar data processing service.
    """
    logger.info("=" * 60)
    logger.info("Basic Daemon Manager Example")
    logger.info("=" * 60)

    # Define volume types
    volume_types = {
        "0315": {
            "01": ["DBZH", "DBZV", "ZDR", "RHOHV", "PHIDP", "KDP"],
            "02": ["VRAD", "WRAD"],
        },
    }

    radar_name = "RMA1"
    base_path = Path(os.path.join(config.ROOT_RADAR_FILES_PATH, radar_name))

    # Create manager configuration
    manager_config = DaemonManagerConfig(
        radar_name=radar_name,
        base_path=base_path,
        ftp_host=config.FTP_HOST,
        ftp_user=config.FTP_USER,
        ftp_password=config.FTP_PASS,
        ftp_base_path="/L2",
        volume_types=volume_types,
        # start_date=datetime(2025, 11, 25, 10, 0, 0, tzinfo=timezone.utc),
        download_poll_interval=60,
        processing_poll_interval=30,
        product_poll_interval=30,
        enable_download_daemon=True,
        enable_processing_daemon=True,
        enable_product_daemon=True,
        product_dir=Path(os.path.join(config.ROOT_RADAR_PRODUCTS_PATH, radar_name)),
        product_type="image",
        add_colmax=True,
        enable_cleanup_daemon=True,
        netcdf_retention_days=2 / 24,
        bufr_retention_days=2 / 24,
        cleanup_poll_interval=1800,
    )

    # Create manager
    manager = DaemonManager(manager_config)

    logger.info("\nStarting daemon manager...")
    logger.info("  Both download and processing daemons will start")
    logger.info("  Press Ctrl+C to stop all daemons\n")

    try:
        asyncio.run(manager.start())
    except KeyboardInterrupt:
        logger.info("\n\nStopping daemons...")
        manager.stop()
        logger.info("All daemons stopped")

    # Show final status
    status = manager.get_status()
    logger.info("\n" + "=" * 60)
    logger.info("Final Status:")
    logger.info(f"  Radar: {status['radar_code']}")
    logger.info(f"  Base path: {status['base_path']}")
    logger.info("\n  Download daemon:")
    logger.info(f"    Enabled: {status['download_daemon']['enabled']}")
    logger.info(f"    Running: {status['download_daemon']['running']}")
    if status["download_daemon"]["stats"]:
        logger.info(f"    Files downloaded: {status['download_daemon']['stats']['total_downloaded']}")
    logger.info("\n  Processing daemon:")
    logger.info(f"    Enabled: {status['processing_daemon']['enabled']}")
    logger.info(f"    Running: {status['processing_daemon']['running']}")
    if status["processing_daemon"]["stats"]:
        logger.info(f"    Volumes processed: {status['processing_daemon']['stats']['volumes_processed']}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
