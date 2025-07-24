import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Card } from "../../../components/ui/Card";
import { Participant } from "../../../types";
import { FormErrors } from "../../../business/validation/groupValidation";
import { participantStyles } from "../styles";

interface ParticipantsSectionProps {
  participants: Participant[];
  newParticipantName: string;
  newParticipantEmail: string;
  errors: FormErrors;
  onParticipantNameChange: (text: string) => void;
  onParticipantEmailChange: (text: string) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
}

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
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
    <Card style={participantStyles.modernCard}>
      <View style={participantStyles.cardHeader}>
        <View style={participantStyles.iconContainer}>
          <Text style={participantStyles.cardIcon}>👥</Text>
        </View>
        <View style={participantStyles.cardHeaderText}>
          <Text style={participantStyles.cardTitle}>
            Participantes ({participants.length + 1})
          </Text>
          <Text style={participantStyles.cardSubtitle}>
            Invita a tus amigos a la juntada circular
          </Text>
        </View>
      </View>

      {/* Participante actual (usuario) */}
      <View style={participantStyles.currentUserContainer}>
        <View style={participantStyles.participantAvatar}>
          <Text style={participantStyles.avatarText}>Tú</Text>
        </View>
        <View style={participantStyles.participantInfo}>
          <Text style={participantStyles.participantName}>
            Tú (organizador)
          </Text>
          <Text style={participantStyles.participantRole}>
            Creador del grupo
          </Text>
        </View>
        <View style={participantStyles.statusBadge}>
          <Text style={participantStyles.statusText}>✓</Text>
        </View>
      </View>

      {/* Lista de participantes */}
      {participants.map((participant) => (
        <View
          key={participant.id}
          style={participantStyles.modernParticipantItem}
        >
          <View style={participantStyles.participantAvatar}>
            <Text style={participantStyles.avatarText}>
              {participant.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={participantStyles.participantInfo}>
            <Text style={participantStyles.participantName}>
              {participant.name}
            </Text>
            {participant.email ? (
              <Text style={participantStyles.participantEmail}>
                {participant.email}
              </Text>
            ) : (
              <Text style={participantStyles.participantRole}>
                Participante
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={participantStyles.modernRemoveButton}
            onPress={() => onRemoveParticipant(participant.id)}
            activeOpacity={0.8}
          >
            <Text style={participantStyles.modernRemoveButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Agregar participante */}
      <View style={participantStyles.addParticipantSection}>
        <View style={participantStyles.addParticipantHeader}>
          <Text style={participantStyles.addParticipantTitle}>
            Agregar participante
          </Text>
          <Text style={participantStyles.addParticipantSubtitle}>
            Los participantes recibirán una notificación
          </Text>
        </View>

        <View style={participantStyles.modernInputGroup}>
          <View style={participantStyles.inputWrapper}>
            <View style={participantStyles.inputIconContainer}>
              <Text style={participantStyles.inputIcon}>👤</Text>
            </View>
            <View style={participantStyles.inputContent}>
              <Text style={participantStyles.modernInputLabel}>
                Nombre completo *
              </Text>
              <TextInput
                style={participantStyles.modernTextInput}
                placeholder="Ingresa el nombre del participante"
                value={newParticipantName}
                onChangeText={onParticipantNameChange}
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>
          {errors.newParticipantName && (
            <Text style={participantStyles.modernErrorText}>
              {errors.newParticipantName}
            </Text>
          )}
        </View>

        <View style={participantStyles.modernInputGroup}>
          <View style={participantStyles.inputWrapper}>
            <View style={participantStyles.inputIconContainer}>
              <Text style={participantStyles.inputIcon}>✉️</Text>
            </View>
            <View style={participantStyles.inputContent}>
              <Text style={participantStyles.modernInputLabel}>
                Email (opcional)
              </Text>
              <TextInput
                style={participantStyles.modernTextInput}
                placeholder="email@ejemplo.com"
                value={newParticipantEmail}
                onChangeText={onParticipantEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>
          {errors.newParticipantEmail && (
            <Text style={participantStyles.modernErrorText}>
              {errors.newParticipantEmail}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={participantStyles.addParticipantButton}
          onPress={onAddParticipant}
          activeOpacity={0.8}
        >
          <Text style={participantStyles.addParticipantButtonIcon}>+</Text>
          <Text style={participantStyles.addParticipantButtonText}>
            Agregar Participante
          </Text>
        </TouchableOpacity>

        {errors.participants && (
          <Text style={participantStyles.modernErrorText}>
            {errors.participants}
          </Text>
        )}
      </View>
    </Card>
  );
};
