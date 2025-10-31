/**
 * Mock VHD Library for Testing
 * 
 * This mock simulates the vhd library's callback-based API
 * without requiring actual VHD files on disk.
 */

class MockImage {
  constructor(options) {
    this.path = options.path;
    this.flags = options.flags;
    this.footer = null;
    this.header = null;
  }

  open(callback) {
    // Simulate async operation
    process.nextTick(() => {
      try {
        // Parse filename to determine VHD characteristics
        const filename = this.path.toLowerCase();
        
        // Check if file should fail
        if (filename.includes('invalid-cookie')) {
          this.footer = this.createFooter({ cookie: 'invalid!' });
          callback(null);
          return;
        }
        
        if (filename.includes('unsupported-version')) {
          this.footer = this.createFooter({ fileFormatVersion: 0x00020000 });
          callback(null);
          return;
        }
        
        if (filename.includes('differencing')) {
          this.footer = this.createFooter({ diskType: 4 });
          this.header = this.createHeader();
          callback(null);
          return;
        }
        
        if (filename.includes('dynamic')) {
          this.footer = this.createFooter({ diskType: 3 });
          this.header = this.createHeader();
          callback(null);
          return;
        }
        
        // Parse size from filename (e.g., "size-30gb.vhd" or "size-2040gb.vhd")
        const sizeMatch = filename.match(/size-(\d+)gb/);
        const sizeGB = sizeMatch ? parseInt(sizeMatch[1]) : 30;
        
        // Parse misalignment flag
        const misaligned = filename.includes('misaligned');
        
        // Default: valid fixed VHD
        this.footer = this.createFooter({
          diskType: 2,
          sizeGB,
          aligned: !misaligned
        });
        
        callback(null);
      } catch (error) {
        callback(error);
      }
    });
  }

  close(callback) {
    // Simulate async operation
    process.nextTick(() => {
      callback(null);
    });
  }

  createFooter(options = {}) {
    const sizeGB = options.sizeGB || 30;
    let totalSize = BigInt(sizeGB) * BigInt(1024 * 1024 * 1024);
    
    // Apply alignment
    const VHD_ALIGNMENT_BOUNDARY = 1024 * 1024; // 1 MB
    if (options.aligned !== false) {
      totalSize = BigInt(Math.floor(Number(totalSize) / VHD_ALIGNMENT_BOUNDARY) * VHD_ALIGNMENT_BOUNDARY);
    } else {
      totalSize += BigInt(512); // Add misalignment
    }
    
    // Calculate CHS geometry
    const totalSectors = Number(totalSize) / 512;
    let cylinders, heads, sectorsPerTrack;
    
    if (totalSectors > 65535 * 16 * 255) {
      // Max geometry
      cylinders = 65535;
      heads = 16;
      sectorsPerTrack = 255;
    } else if (totalSectors >= 65535 * 16 * 63) {
      sectorsPerTrack = 255;
      heads = 16;
      cylinders = Math.floor(totalSectors / (heads * sectorsPerTrack));
    } else {
      sectorsPerTrack = 17;
      heads = Math.floor((totalSectors + 1023) / 1024);
      if (heads < 4) heads = 4;
      if (heads > 16) {
        sectorsPerTrack = 31;
        heads = 16;
      }
      if (heads > 16) {
        sectorsPerTrack = 63;
        heads = 16;
      }
      cylinders = Math.floor(totalSectors / (heads * sectorsPerTrack));
    }

    return {
      cookie: Buffer.from(options.cookie || 'conectix', 'ascii'),
      features: 0x00000002,
      fileFormatVersion: options.fileFormatVersion || 0x00010000,
      dataOffset: options.diskType === 2 ? BigInt('0xFFFFFFFFFFFFFFFF') : BigInt(0x200),
      timestamp: Math.floor(Date.now() / 1000) - 946684800, // VHD epoch
      creatorApplication: Buffer.from('azmp', 'ascii'),
      creatorVersion: 0x00010000,
      creatorHostOS: Buffer.from('Wi2k', 'ascii'),
      originalSize: totalSize,
      currentSize: totalSize,
      diskGeometry: {
        cylinders,
        heads,
        sectorsPerTrack
      },
      diskType: options.diskType || 2,
      checksum: 0xFFFFFFFF,
      uniqueId: Buffer.from('0123456789abcdef0123456789abcdef', 'hex'),
      savedState: 0
    };
  }

  createHeader() {
    return {
      cookie: Buffer.from('cxsparse', 'ascii'),
      dataOffset: BigInt('0xFFFFFFFFFFFFFFFF'),
      tableOffset: BigInt(0x600),
      headerVersion: 0x00010000,
      maxTableEntries: 512,
      blockSize: 2 * 1024 * 1024, // 2 MB
      checksum: 0xFFFFFFFF,
      parentUniqueId: Buffer.alloc(16),
      parentTimestamp: 0,
      parentUnicodeName: Buffer.from('', 'utf16le')
    };
  }
}

module.exports = {
  Image: MockImage
};
