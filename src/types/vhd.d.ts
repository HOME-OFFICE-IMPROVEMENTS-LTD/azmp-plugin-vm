/**
 * Type definitions for vhd npm package
 * The vhd package doesn't have official TypeScript definitions
 */

declare module 'vhd' {
  export class VHD {
    constructor(path: string);
    
    open(): Promise<void>;
    close(): Promise<void>;
    
    footer?: {
      cookie?: Buffer | string;
      features?: number;
      fileFormatVersion?: number;
      dataOffset?: number;
      timestamp?: number;
      creatorApplication?: Buffer | string;
      creatorVersion?: number;
      creatorHostOS?: Buffer | string;
      originalSize?: number;
      currentSize?: number;
      diskGeometry?: {
        cylinders?: number;
        heads?: number;
        sectorsPerTrack?: number;
      };
      diskType?: number;
      checksum?: number;
      uniqueId?: Buffer;
      savedState?: boolean;
    };
    
    header?: {
      cookie?: Buffer | string;
      dataOffset?: number;
      tableOffset?: number;
      headerVersion?: number;
      maxTableEntries?: number;
      blockSize?: number;
      checksum?: number;
      parentUniqueId?: Buffer;
      parentTimestamp?: number;
      parentUnicodeName?: Buffer | string;
    };
  }
}
