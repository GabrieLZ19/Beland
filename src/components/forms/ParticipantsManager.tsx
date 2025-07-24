import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Button } from "../ui/Button";
import { Participant } from "../../types";
import { formStyles, commonStyles } from "../../styles";

interface ParticipantsManagerProps {
  participants: Participant[];
  newParticipantName: string;
  newParticipantEmail: string;
  errors: any;
  onParticipantNameChange: (text: string) => void;
  onParticipantEmailChange: (text: string) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
}

export const ParticipantsManager: React.FC<ParticipantsManagerProps> = ({
  participants,
  newParticipantName,
  newParticipantEmail,
  errors,
  onParticipantNameChange,
  onParticipantEmailChange,
  onAddParticipant,
  onRemoveParticipant,
}) => {
  return (
    <>
      <Text style={commonStyles.cardTitle}>
        Participantes ({participants.length + 1})
      </Text>
      <Text style={commonStyles.cardSubtitle}>
        Tú estás incluido automáticamente
      </Text>

      {/* Lista de participantes */}
      {participants.map((participant) => (
        <View key={participant.id} style={participantStyles.participantItem}>
          <View style={participantStyles.participantInfo}>
            <Text style={participantStyles.participantName}>
              {participant.name}
            </Text>
            {participant.email ? (
              <Text style={participantStyles.participantEmail}>
                {participant.email}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={participantStyles.removeButton}
            onPress={() => onRemoveParticipant(participant.id)}
          >
            <Text style={participantStyles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Agregar participante */}
      <View style={formStyles.addParticipantContainer}>
        <View style={formStyles.inputGroup}>
          <Text style={formStyles.inputLabel}>Nombre del participante *</Text>
          <TextInput
            style={formStyles.textInput}
            placeholder="Nombre completo"
            value={newParticipantName}
            onChangeText={onParticipantNameChange}
          />
          {errors.newParticipantName && (
            <Text style={commonStyles.errorText}>
              {errors.newParticipantName}
            </Text>
          )}
        </View>
        <View style={formStyles.inputGroup}>
          <Text style={formStyles.inputLabel}>Email (opcional)</Text>
          <TextInput
            style={formStyles.textInput}
            placeholder="email@ejemplo.com"
            value={newParticipantEmail}
            onChangeText={onParticipantEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.newParticipantEmail && (
            <Text style={commonStyles.errorText}>
              {errors.newParticipantEmail}
            </Text>
          )}
        </View>
        <Button
          title="Agregar Participante"
          onPress={onAddParticipant}
          variant="secondary"
        />
        {errors.participants && (
          <Text style={commonStyles.errorText}>{errors.participants}</Text>
        )}
      </View>
    </>
  );
};

const participantStyles = {
  participantItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333333",
  },
  participantEmail: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFEBEE",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  removeButtonText: {
    color: "#F44336",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
};
