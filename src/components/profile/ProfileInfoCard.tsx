import React from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { Button } from "@/components/common/Button";

interface ProfileInfoCardProps {
  user: any;
  onEdit: () => void;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  user,
  onEdit,
}) => (
  <ThemedView style={styles.card}>
    <ThemedView style={styles.cardHeader}>
      <ThemedView style={styles.cardTitleContainer}>
        <IconSymbol
          name="person.fill"
          size={20}
          color="#4CAF50"
          style={styles.cardIcon}
        />
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Profile Information
        </ThemedText>
      </ThemedView>
      <Button variant="outline" size="small" onPress={onEdit}>
        Edit
      </Button>
    </ThemedView>
    <ThemedView style={styles.profileInfo}>
      <ThemedView style={styles.infoItem}>
        <IconSymbol
          name="person.fill"
          size={18}
          color="#666666"
          style={styles.infoIcon}
        />
        <ThemedView style={styles.infoContent}>
          <ThemedText type="caption" style={styles.infoLabel}>
            Phone
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            {user?.phone_number || "Not set"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.infoItem}>
        <IconSymbol
          name="calendar"
          size={18}
          color="#666666"
          style={styles.infoIcon}
        />
        <ThemedView style={styles.infoContent}>
          <ThemedText type="caption" style={styles.infoLabel}>
            Date of Birth
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            {user?.date_of_birth || "Not set"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.infoItem}>
        <IconSymbol
          name="location.fill"
          size={18}
          color="#666666"
          style={styles.infoIcon}
        />
        <ThemedView style={styles.infoContent}>
          <ThemedText type="caption" style={styles.infoLabel}>
            Address
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            {user?.address?.street
              ? `${user.address.street}, ${user.address.city || ""}, ${
                  user.address.state || ""
                }`
              : "Not set"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  </ThemedView>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: "#666666",
  },
  profileInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: "#666666",
    marginBottom: 4,
  },
  infoValue: {
    color: "#333333",
    fontWeight: "500",
  },
});
