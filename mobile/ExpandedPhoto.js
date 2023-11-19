import React from 'react';
import { Modal, Image, View, Text } from 'react-native';

const ExpandedPhoto = ({ visible, photo, onClose }) => {
  console.log("Photo URL:", photo); // Add this line
  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.modalContainer}>
        <Image source={{ uri: photo }} style={styles.expandedImage} />
        <Text style={styles.closeButton} onPress={onClose}>
          Cerrar
        </Text>
      </View>
    </Modal>
  );
};


const styles = {
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  expandedImage: {
    width: 300,
    height: 300,
  },
  closeButton: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
};

export default ExpandedPhoto;
