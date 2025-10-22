/**
 * Azure VM Image References
 * Source: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/cli-ps-findimage
 */

export interface VmImageReference {
  publisher: string;
  offer: string;
  sku: string;
  version: string;
  os: 'Windows' | 'Linux';
  description: string;
}

export const VM_IMAGES: Record<string, VmImageReference> = {
  // Windows Server
  'windows-2022': {
    publisher: 'MicrosoftWindowsServer',
    offer: 'WindowsServer',
    sku: '2022-datacenter-azure-edition',
    version: 'latest',
    os: 'Windows',
    description: 'Windows Server 2022 Datacenter - Azure Edition',
  },
  'windows-2022-core': {
    publisher: 'MicrosoftWindowsServer',
    offer: 'WindowsServer',
    sku: '2022-datacenter-core-azure-edition',
    version: 'latest',
    os: 'Windows',
    description: 'Windows Server 2022 Datacenter Core - Azure Edition',
  },
  'windows-2019': {
    publisher: 'MicrosoftWindowsServer',
    offer: 'WindowsServer',
    sku: '2019-datacenter',
    version: 'latest',
    os: 'Windows',
    description: 'Windows Server 2019 Datacenter',
  },
  'windows-2016': {
    publisher: 'MicrosoftWindowsServer',
    offer: 'WindowsServer',
    sku: '2016-datacenter',
    version: 'latest',
    os: 'Windows',
    description: 'Windows Server 2016 Datacenter',
  },
  'windows-2012-r2': {
    publisher: 'MicrosoftWindowsServer',
    offer: 'WindowsServer',
    sku: '2012-r2-datacenter',
    version: 'latest',
    os: 'Windows',
    description: 'Windows Server 2012 R2 Datacenter',
  },

  // Ubuntu
  'ubuntu-22.04': {
    publisher: 'Canonical',
    offer: '0001-com-ubuntu-server-jammy',
    sku: '22_04-lts-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Ubuntu Server 22.04 LTS (Jammy Jellyfish)',
  },
  'ubuntu-20.04': {
    publisher: 'Canonical',
    offer: '0001-com-ubuntu-server-focal',
    sku: '20_04-lts-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Ubuntu Server 20.04 LTS (Focal Fossa)',
  },
  'ubuntu-18.04': {
    publisher: 'Canonical',
    offer: 'UbuntuServer',
    sku: '18_04-lts-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Ubuntu Server 18.04 LTS (Bionic Beaver)',
  },

  // Red Hat Enterprise Linux
  'rhel-9': {
    publisher: 'RedHat',
    offer: 'RHEL',
    sku: '9-lvm-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Red Hat Enterprise Linux 9 (LVM)',
  },
  'rhel-8': {
    publisher: 'RedHat',
    offer: 'RHEL',
    sku: '8-lvm-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Red Hat Enterprise Linux 8 (LVM)',
  },
  'rhel-7': {
    publisher: 'RedHat',
    offer: 'RHEL',
    sku: '7-lvm-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Red Hat Enterprise Linux 7 (LVM)',
  },

  // SUSE Linux Enterprise Server
  'sles-15': {
    publisher: 'SUSE',
    offer: 'sles-15-sp5',
    sku: 'gen2',
    version: 'latest',
    os: 'Linux',
    description: 'SUSE Linux Enterprise Server 15 SP5',
  },
  'sles-12': {
    publisher: 'SUSE',
    offer: 'sles-12-sp5',
    sku: 'gen2',
    version: 'latest',
    os: 'Linux',
    description: 'SUSE Linux Enterprise Server 12 SP5',
  },

  // CentOS (via OpenLogic)
  'centos-8': {
    publisher: 'OpenLogic',
    offer: 'CentOS',
    sku: '8_5-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'CentOS 8.5',
  },
  'centos-7': {
    publisher: 'OpenLogic',
    offer: 'CentOS',
    sku: '7_9-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'CentOS 7.9',
  },

  // Debian
  'debian-11': {
    publisher: 'debian',
    offer: 'debian-11',
    sku: '11-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Debian 11 (Bullseye)',
  },
  'debian-10': {
    publisher: 'debian',
    offer: 'debian-10',
    sku: '10-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Debian 10 (Buster)',
  },

  // Oracle Linux
  'oracle-linux-8': {
    publisher: 'Oracle',
    offer: 'Oracle-Linux',
    sku: '8-lvm-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Oracle Linux 8',
  },
  'oracle-linux-7': {
    publisher: 'Oracle',
    offer: 'Oracle-Linux',
    sku: '7-lvm-gen2',
    version: 'latest',
    os: 'Linux',
    description: 'Oracle Linux 7',
  },
};

export function getVmImage(key: string): VmImageReference | undefined {
  return VM_IMAGES[key];
}

export function getAllVmImages(): Array<{ key: string; image: VmImageReference }> {
  return Object.entries(VM_IMAGES).map(([key, image]) => ({ key, image }));
}

export function getVmImagesByOS(os: 'Windows' | 'Linux'): Array<{ key: string; image: VmImageReference }> {
  return Object.entries(VM_IMAGES)
    .filter(([_, image]) => image.os === os)
    .map(([key, image]) => ({ key, image }));
}

export function searchVmImages(query: string): Array<{ key: string; image: VmImageReference }> {
  const lowerQuery = query.toLowerCase();
  return Object.entries(VM_IMAGES)
    .filter(
      ([key, image]) =>
        key.toLowerCase().includes(lowerQuery) ||
        image.description.toLowerCase().includes(lowerQuery) ||
        image.publisher.toLowerCase().includes(lowerQuery) ||
        image.offer.toLowerCase().includes(lowerQuery)
    )
    .map(([key, image]) => ({ key, image }));
}
