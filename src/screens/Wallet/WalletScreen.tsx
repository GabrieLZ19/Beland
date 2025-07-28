import React, { useState } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WaveBottomGray } from "../../components/icons";
import {
  WalletHeader,
  WalletBalanceCard,
  WalletActions,
  FRSCard,
} from "./components";
import { PaymentPreferences } from "./components/PaymentPreferences";
import { useWalletData, useWalletActions } from "./hooks";
import { containerStyles } from "./styles";
import { PayphoneWidget } from "../../components/ui/PayphoneWidget";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from "react-native";

const payphoneLogo = require("../../../assets/payphone-logo.png");

type PaymentAccountType = "payphone" | "bank" | null;

export const WalletScreen: React.FC = () => {
  const { walletData, frsData } = useWalletData();
  const { walletActions } = useWalletActions();
  const [showPayphone, setShowPayphone] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<PaymentAccountType>(null);

  // Ejemplo de props para la cajita Payphone (reemplaza por tus datos reales)
  const payphoneProps = {
    token: "YOUR_TOKEN",
    amount: 315,
    amountWithoutTax: 200,
    amountWithTax: 100,
    tax: 15,
    service: 0,
    tip: 0,
    storeId: "YOUR_STOREID",
    reference: "Motivo de Pago",
    currency: "USD",
    clientTransactionId: "ID-UNICO-X-TRANSACCION",
    backgroundColor: "#6610f2",
    // Para mobile, la url de pago generada
    urlMobile: "https://pay.payphonetodoesposible.com/api/button/your-pay-url",
  };

  return (
    <SafeAreaView style={containerStyles.container} edges={["bottom"]}>
      {/* Modal para elegir tipo de cuenta */}
      <Modal
        visible={showAccountModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir método de pago</Text>
            <Pressable
              style={styles.accountOption}
              onPress={() => {
                setSelectedAccount("payphone");
                setShowAccountModal(false);
              }}
            >
              <Image source={payphoneLogo} style={styles.accountLogo} />
              <Text style={styles.accountText}>Cuenta de Payphone</Text>
            </Pressable>
            <Pressable
              style={styles.accountOption}
              onPress={() => {
                setSelectedAccount("bank");
                setShowAccountModal(false);
              }}
            >
              <Text style={styles.bankIcon}>🏦</Text>
              <Text style={styles.accountText}>Cuenta Bancaria</Text>
            </Pressable>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowAccountModal(false)}
            >
              <Text style={{ color: "#6610f2", fontWeight: "bold" }}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Widget Payphone solo si está seleccionado y showPayphone */}
      {showPayphone && selectedAccount === "payphone" ? (
        <PayphoneWidget
          {...payphoneProps}
          onClose={() => setShowPayphone(false)}
        />
      ) : (
        <>
          <ScrollView style={containerStyles.scrollView}>
            <View style={containerStyles.content}>
              <WalletHeader />
              <WalletBalanceCard walletData={walletData} />
              <WalletActions
                actions={walletActions.map((action) =>
                  action.id === "send"
                    ? {
                        ...action,
                        onPress: () => {
                          if (selectedAccount === "payphone")
                            setShowPayphone(true);
                          // Aquí podrías manejar lógica para banco si lo deseas
                        },
                      }
                    : action
                )}
              />

              <PaymentPreferences
                showAccountModal={showAccountModal}
                setShowAccountModal={setShowAccountModal}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                payphoneLogo={payphoneLogo}
                styles={styles}
              />
            </View>
          </ScrollView>
          <View style={containerStyles.waveContainer}>
            <WaveBottomGray
              width={Dimensions.get("window").width}
              height={120}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  paymentPrefCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentPrefHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentPrefTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  addBtn: {
    backgroundColor: "#e6f0ff",
    borderRadius: 50,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#6610f2",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: -2,
  },
  noAccountText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 18,
  },
  selectedAccountBox: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#6610f2",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  accountLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
    resizeMode: "contain",
    borderRadius: 8,
  },
  accountText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  bankIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#222",
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    width: 240,
  },
  closeModalBtn: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
  },
});
