import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import DatePicker from "react-native-modern-datepicker";
import { SafeAreaView } from "react-native-safe-area-context";

const FiltroModal = ({ isVisible, onClose, onApplyFilter }) => {
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleApplyFilter = () => {
    console.log("Selected Date:", selectedDate);
    onApplyFilter(selectedDate);
    onClose();
  };
  const handleDateChange = (date) => {
    const formattedDate = new Date(date);
    console.log("Selected Date changed:", formattedDate);
    setSelectedDate(formattedDate);
    setOpenDatePicker(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text>Selecciona la fecha</Text>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setOpenDatePicker(!openDatePicker)}
          >
            <Text>{selectedDate.toDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={() => {
              onApplyFilter(selectedDate);  // Pasar la fecha seleccionada
              onClose();
            }}
          >
            <Text style={styles.aplicarButtonText}>Aplicar Filtro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={openDatePicker}
            onRequestClose={() => setOpenDatePicker(false)}
          >
            <View style={styles.datePickerModal}>
              <DatePicker
                mode="calendar"
                selected={selectedDate.toISOString().split('T')[0]}
                onDateChanged={handleDateChange}
              />

              <TouchableOpacity onPress={() => setOpenDatePicker(false)}>
                <Text style={{ color: "white" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    width: "80%",
  },
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#222",
    height: 50,
    paddingLeft: 8,
    fontSize: 18,
    justifyContent: "center",
    marginTop: 14,
  },
  applyFilterButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  aplicarButtonText: {
    color: "white",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "red",
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
  },
  datePickerModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default FiltroModal;
