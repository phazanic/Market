export const STALL_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type StallStatus = typeof STALL_STATUS[keyof typeof STALL_STATUS];

export const VENDOR_TYPE = {
  FIXED: 'FIXED',
  CASUAL: 'CASUAL',
} as const;

export type VendorType = typeof VENDOR_TYPE[keyof typeof VENDOR_TYPE];

export const STALL_STATUS_COLORS: Record<StallStatus, string> = {
  [STALL_STATUS.AVAILABLE]: 'bg-green-100 text-green-700',
  [STALL_STATUS.OCCUPIED]: 'bg-blue-100 text-blue-700',
  [STALL_STATUS.MAINTENANCE]: 'bg-red-100 text-red-700',
};

export const VENDOR_TYPE_COLORS: Record<VendorType, string> = {
  [VENDOR_TYPE.FIXED]: 'bg-purple-100 text-purple-700',
  [VENDOR_TYPE.CASUAL]: 'bg-orange-100 text-orange-700',
};
