import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const modalStyles = StyleSheet.create({
  // Modal de ubicación
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  // Lista de ubicaciones
  locationList: {
    maxHeight: 500,
    padding: 20,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  mapButtonSelected: {
    backgroundColor: "#EBF4FF",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  mapButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  mapButtonContent: {
    flex: 1,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mapButtonSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  mapButtonArrow: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  locationDivider: {
    alignItems: "center",
    marginVertical: 16,
  },
  locationDividerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  locationOptionIcon: {
    fontSize: 18,
    marginRight: 16,
  },
  locationOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },

  // Modal de tiempo
  timeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timeModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "95%",
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  timePickerContainer: {
    padding: 20,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timePicker: {
    height: 120,
    width: 70,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  timePickerContent: {
    paddingVertical: 8,
  },
  timeOption: {
    minHeight: 32,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timeOptionSelected: {
    backgroundColor: colors.belandOrange,
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  timeOptionTextSelected: {
    color: "white",
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginHorizontal: 8,
    alignSelf: "center",
    marginTop: 30,
  },
  timePreview: {
    backgroundColor: colors.belandOrange + "15",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.belandOrange + "30",
  },
  timePreviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  timePreviewText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  confirmTimeButton: {
    backgroundColor: colors.belandOrange,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 8,
  },
  confirmTimeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
