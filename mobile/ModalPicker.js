import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

const ModalPicker = ({ isVisible, onClose, onSelectMonthYear }) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const handleSelectMonthYear = () => {
    onSelectMonthYear({ month: selectedMonth, year: selectedYear });
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInDown"
      animationOut="slideOutUp"
      onBackdropPress={onClose}
    >
      <View style={styles.eventModal}>
        {/* Contenido del modal de eventos */}
        <Text>Selecciona por mes o año</Text>

        <View style={styles.selectorContainer}>
          <Text>Mes:</Text>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            <Picker.Item label="Enero" value="Enero" />
            <Picker.Item label="Febrero" value="Febrero" />
            <Picker.Item label="Marzo" value="Marzo" />
            <Picker.Item label="Abril" value="Abril" />
            <Picker.Item label="Mayo" value="Mayo" />
            <Picker.Item label="Junio" value="Junio" />
            <Picker.Item label="Julio" value="Julio" />
            <Picker.Item label="Agosto" value="Agosto" />
            <Picker.Item label="Septiembre" value="Septiembre" />
            <Picker.Item label="Octubre" value="Octubre" />
            <Picker.Item label="Noviembre" value="Noviembre" />
            <Picker.Item label="Diciembre" value="Diciembre" />
          </Picker>
        </View>

        <View style={styles.selectorContainer}>
          <Text>Año:</Text>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            <Picker.Item label="2023" value="2023" />
            <Picker.Item label="2024" value="2024" />
            <Picker.Item label="2025" value="2025" />
            <Picker.Item label="2026" value="2026" />
            <Picker.Item label="2027" value="2027" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={handleSelectMonthYear}>
          <Text>Filtrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  eventModal: {
    backgroundColor: "white",
    padding: 16,
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 4,
  },
});

export default ModalPicker;