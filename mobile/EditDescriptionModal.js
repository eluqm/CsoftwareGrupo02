import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function EditDescriptionModal({ onCancel, onSave, initialValue }) {
  const [newDescription, setNewDescription] = useState(initialValue);

  return (
    <View style={styles.editDescriptionModal}>
      <Text style={styles.editDescriptionTitle}>Editar Descripción</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="Editar descripción"
        onChangeText={(text) => setNewDescription(text)}
        value={newDescription}
      />
      <View style={styles.editDescriptionButtons}>
        <TouchableOpacity
          style={styles.cancelEditButton}
          onPress={() => onCancel()}
        >
          <Text style={styles.cancelEditButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveDescriptionButton}
          onPress={() => {
            onSave(newDescription);
          }}
        >
          <Text style={styles.saveDescriptionButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editDescriptionModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  editDescriptionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  descriptionInput: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  editDescriptionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelEditButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelEditButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10
  },
  saveDescriptionButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  saveDescriptionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10
  },
});
