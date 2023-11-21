import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

const ModalPicker = ({ isVisible, onClose, onSelectMonthYear, onApplyFilter, setFilterActive }) => {

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [selectedDay, setSelectedDay] = useState("");

  const handleSelectMonthYear = () => {
    onSelectMonthYear({ month: selectedMonth, year: selectedYear });
    onClose();
  };

  const handleApplyFilter = () => {
    const selectedDate = {
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
    };
    setFilterActive(true);
    onApplyFilter(selectedDate);
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
        <Text>Seleciona El Dia - Mes - Año </Text>


        <View style={styles.selectorContainer}>
          <Text>Día:</Text>
          <Picker
            style={styles.picker}
            selectedValue={selectedDay}
            onValueChange={(itemValue) => setSelectedDay(itemValue)}
          >
            {[...Array(31).keys()].map((day) => (
              <Picker.Item key={day.toString()} label={(day + 1).toString()} value={(day + 1).toString()} />
            ))}
          </Picker>
        </View>


        <View style={styles.selectorContainer}>
          <Text>Mes:</Text>
          <Picker
            style={styles.picker}
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
            style={styles.picker}
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

        <Text>Seleccionado: {selectedDay} {selectedMonth} {selectedYear}</Text>

        <TouchableOpacity style={styles.applyFilterButton} onPress={handleApplyFilter}>
          <Text style={styles.aplicarButtonText}>Aplicar Filtro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  eventModal: {
    backgroundColor: "white",
    padding: 16,
    margin: 40,
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  picker: {
    flex: 1,
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
});

export default ModalPicker;
