import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface WithdrawModalProps {
  visible: boolean;
  balance: number;
  withdrawAmount: string;
  selectedBank: string;
  errorMessage: string;
  onClose: () => void;
  onAmountChange: (amount: string) => void;
  onBankSelect: (bank: string) => void;
  onConfirm: () => void;
}

export function WithdrawModal({
  visible,
  balance,
  withdrawAmount,
  selectedBank,
  errorMessage,
  onClose,
  onAmountChange,
  onBankSelect,
  onConfirm,
}: WithdrawModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <View style={styles.dragBar} />
            <Text style={styles.modalTitle}>Withdraw Payout</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
            {balance <= 0 ? (
              <View style={styles.emptyBalanceState}>
                <Text style={styles.errorMessage}>You don't have any funds to withdraw yet!</Text>
                <Text style={styles.modalHelpText}>
                  Earn rewards by participating in tours and campaigns in your feed!
                </Text>
                <Pressable style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>Available Balance: ₦{balance.toFixed(2)}</Text>

                {/* Input Amount with localized Naira prefix */}
                <View style={styles.inputContainer}>
                  <Text style={styles.currencyPrefix}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#BEBEBE"
                    keyboardType="numeric"
                    value={withdrawAmount}
                    onChangeText={onAmountChange}
                    autoFocus
                  />
                </View>

                {errorMessage ? (
                  <Text style={styles.modalError}>{errorMessage}</Text>
                ) : null}

                {/* Bank Picker */}
                <Text style={styles.inputLabel}>Destination Bank</Text>
                <View style={styles.bankPicker}>
                  {["Access Bank", "GTBank", "Zenith Bank"].map((bank) => {
                    const selected = selectedBank === bank;
                    return (
                      <Pressable
                        key={bank}
                        style={[styles.bankOption, selected && styles.bankOptionSelected]}
                        onPress={() => onBankSelect(bank)}
                      >
                        <Text style={[styles.bankOptionText, selected && styles.bankOptionTextSelected]}>
                          {bank}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Submit Button */}
                <Pressable
                  style={({ pressed }) => [styles.confirmWithdrawBtn, pressed && styles.btnPressed]}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmWithdrawBtnText}>Confirm Withdrawal</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E7E7E7",
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 20,
    color: "#1A1A1A",
  },
  modalScroll: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1B17B3",
    paddingBottom: 4,
    marginBottom: 12,
  },
  currencyPrefix: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 32,
    color: "#1A1A1A",
    marginRight: 6,
  },
  amountInput: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 32,
    color: "#1A1A1A",
    flex: 1,
    padding: 0,
  },
  modalError: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#FF3B30",
    marginBottom: 12,
  },
  bankPicker: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  bankOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  bankOptionSelected: {
    borderColor: "#1B17B3",
    backgroundColor: "#EAE9FC",
  },
  bankOptionText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#8A8A8A",
  },
  bankOptionTextSelected: {
    fontFamily: "Ubuntu_500Medium",
    color: "#1B17B3",
  },
  confirmWithdrawBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  confirmWithdrawBtnText: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  emptyBalanceState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 12,
  },
  errorMessage: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  modalHelpText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#8A8A8A",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  closeBtn: {
    height: 44,
    width: 120,
    borderRadius: 22,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  closeBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#1A1A1A",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
