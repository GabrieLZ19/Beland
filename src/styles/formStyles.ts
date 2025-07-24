import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  // Inputs básicos
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addParticipantContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  createButtonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },

  // Secciones y títulos
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
  },

  // Opciones y tarjetas
  optionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOptionCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: 12,
  },
  selectedOptionTitle: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Radio buttons
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    backgroundColor: "transparent",
  },
  radioButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  // Participantes
  participantOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedParticipantOption: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },

  // Montos personalizados
  balanceInfo: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceStatus: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  balanceOk: {
    color: "#10B981",
  },
  balanceError: {
    color: "#EF4444",
  },
  customAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 8,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 16,
    color: colors.textPrimary,
    minWidth: 60,
    paddingVertical: 8,
    textAlign: "right",
  },

  // Resumen de pago
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  summaryHighlight: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  summaryLabelHighlight: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  summaryValueHighlight: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  // Errores
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  readOnlyNotice: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});
