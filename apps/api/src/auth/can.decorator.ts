import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@storedesk/shared";

export const CAN_KEY = "storedesk:can";
export const PUBLIC_KEY = "storedesk:public";

/** Route needs this permission key (from packages/shared/src/permissions.ts). */
export const Can = (permission: Permission) => SetMetadata(CAN_KEY, permission);

/** Route is open without login (health, login, password reset). Use sparingly. */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
