import { base44 } from "@/api/base44Client";

/**
 * Helper function to log inventory audit entries
 */
export async function logInventoryAudit({
  orgId,
  actionType,
  entityType,
  entityId,
  entityName,
  performedById,
  performedByName,
  performedByEmail,
  previousValues = null,
  newValues = null,
  quantityChanged = null,
  locationId = null,
  locationName = null,
  batchNumber = null,
  notes = null,
  details = null
}) {
  try {
    await base44.entities.InventoryAudit.create({
      organisation_id: orgId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      performed_by_id: performedById,
      performed_by_name: performedByName,
      performed_by_email: performedByEmail,
      previous_values: previousValues,
      new_values: newValues,
      quantity_changed: quantityChanged,
      location_id: locationId,
      location_name: locationName,
      batch_number: batchNumber,
      notes: notes,
      details: details
    });
  } catch (error) {
    console.error("Failed to log inventory audit:", error);
  }
}

export default logInventoryAudit;