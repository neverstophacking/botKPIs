import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly Store: 'Store';
    readonly Order: 'Order';
    readonly OrderItem: 'OrderItem';
    readonly WhatsAppUser: 'WhatsAppUser';
    readonly ReconciliationRun: 'ReconciliationRun';
    readonly SystemAlert: 'SystemAlert';
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: 'ReadUncommitted';
    readonly ReadCommitted: 'ReadCommitted';
    readonly RepeatableRead: 'RepeatableRead';
    readonly Serializable: 'Serializable';
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const StoreScalarFieldEnum: {
    readonly id: 'id';
    readonly code: 'code';
    readonly name: 'name';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type StoreScalarFieldEnum = (typeof StoreScalarFieldEnum)[keyof typeof StoreScalarFieldEnum];
export declare const OrderScalarFieldEnum: {
    readonly id: 'id';
    readonly storeId: 'storeId';
    readonly wooOrderId: 'wooOrderId';
    readonly status: 'status';
    readonly currency: 'currency';
    readonly dateCreated: 'dateCreated';
    readonly dateModified: 'dateModified';
    readonly total: 'total';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum];
export declare const OrderItemScalarFieldEnum: {
    readonly id: 'id';
    readonly orderId: 'orderId';
    readonly wooItemId: 'wooItemId';
    readonly productId: 'productId';
    readonly variationId: 'variationId';
    readonly sku: 'sku';
    readonly productName: 'productName';
    readonly quantity: 'quantity';
    readonly subtotal: 'subtotal';
    readonly total: 'total';
};
export type OrderItemScalarFieldEnum = (typeof OrderItemScalarFieldEnum)[keyof typeof OrderItemScalarFieldEnum];
export declare const WhatsAppUserScalarFieldEnum: {
    readonly id: 'id';
    readonly phone: 'phone';
    readonly name: 'name';
    readonly role: 'role';
    readonly storeCode: 'storeCode';
    readonly active: 'active';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type WhatsAppUserScalarFieldEnum = (typeof WhatsAppUserScalarFieldEnum)[keyof typeof WhatsAppUserScalarFieldEnum];
export declare const ReconciliationRunScalarFieldEnum: {
    readonly id: 'id';
    readonly storeCode: 'storeCode';
    readonly dateFrom: 'dateFrom';
    readonly dateTo: 'dateTo';
    readonly ok: 'ok';
    readonly details: 'details';
    readonly createdAt: 'createdAt';
};
export type ReconciliationRunScalarFieldEnum = (typeof ReconciliationRunScalarFieldEnum)[keyof typeof ReconciliationRunScalarFieldEnum];
export declare const SystemAlertScalarFieldEnum: {
    readonly id: 'id';
    readonly type: 'type';
    readonly severity: 'severity';
    readonly storeCode: 'storeCode';
    readonly message: 'message';
    readonly details: 'details';
    readonly resolved: 'resolved';
    readonly createdAt: 'createdAt';
    readonly resolvedAt: 'resolvedAt';
};
export type SystemAlertScalarFieldEnum = (typeof SystemAlertScalarFieldEnum)[keyof typeof SystemAlertScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: 'asc';
    readonly desc: 'desc';
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const QueryMode: {
    readonly default: 'default';
    readonly insensitive: 'insensitive';
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: 'first';
    readonly last: 'last';
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map