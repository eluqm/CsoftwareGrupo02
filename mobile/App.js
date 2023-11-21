import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, Button, TouchableOpacity, Image, TextInput } from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import ExpandedPhoto from './ExpandedPhoto';
import axios from 'axios';
import Login from './Login';
import { EventEmitter } from 'events';
import EditDescriptionModal from './EditDescriptionModal';
//import FiltroModal from './FiltroModal';
import FiltroModal from './ModalPicker';


let loggedInUser = null;

export default function App() {
  const [currentMarkerLocation, setCurrentMarkerLocation] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [inCurrentZone, setInCurrentZone] = useState(true);
  const [reportedZones, setReportedZones] = useState([]);
  const [description, setDescription] = useState('');
  const [locationInitialized, setLocationInitialized] = useState(false);
  const [fixedLocation, setFixedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zonasConParametros, setZonasConParametros] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dni, setDNI] = useState('');

  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);



  const [showExpandedPhoto, setShowExpandedPhoto] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  const [reportId, setReportId] = useState(null);

  const [response, setResponse] = useState();


  const cameraRef = useRef(null);

  const [userDNI, setUserDNI] = useState('');


  const [newDescription, setNewDescription] = useState('');

  const [editDescriptionMode, setEditDescriptionMode] = useState(false);

  const { EventEmitter } = require('events');

  //const [showFiltroModal, setShowFiltroModal] = useState(false);
  const [selectedFilterYear, setSelectedFilterYear] = useState("");
  const [selectedFilterMonth, setSelectedFilterMonth] = useState("");

  const [showFiltroModal, setShowFiltroModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);

  const [eventosFiltrados, setEventosFiltrados] = useState([]);

  const [filteredEvents, setFilteredEvents] = useState([]);



  useEffect(() => {
    fetchFixedLocation();
  }, []);

  /* zona actual del usuario */
  const fetchFixedLocation = async () => {
    try {
      const response = await axios.get('http://192.168.1.105:4000/api/fixed-location');
      console.log('Response:', response.data);
      if (response.data.success) {
        const fixedLocations = response.data.fixedLocations.map(location => ({
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
        }));
        setReportedZones(fixedLocations);
      } else {
        console.error('Ubicación fija no encontrada');
      }
    } catch (error) {
      console.error('Error al obtener la ubicación fija:', error);
    }
  };


  /* traemos la zonas reportadas desde el backend y lo mostramos en el mapa */
  const fetchZonasConParametros = async () => {
    try {
      const response = await axios.get('http://192.168.1.105:4000/api/zonas-con-parametros');
      if (response.data.success) {
        const zonas = response.data.zonasConParametros.map(location => ({
          latitude: parseFloat(location.x),
          longitude: parseFloat(location.y),
          id_zona: location.id_zona,
          nombre_zona: location.nombre_zona,
        }));
        setZonasConParametros(zonas);
      } else {
        console.error('Ubicación fija no encontrada');
      }
    } catch (error) {
      console.error('ZONA FIJA:', error);
    }
  };



  const fetchImageURL = async (id_evento) => {
    try {
      const response = await axios.get(`http://192.168.1.105:4000/api/imagen/${id_evento}`);

      console.log("Response Status:", response.status);
      console.log("Data:", response.data);
      console.log("Image URL:", response.data.imagen);

      if (response.status === 200) {
        console.log("Etapa 1");
        return response.data.imagen;
      } else {
        console.error('Error in image request: Invalid response', response);
        return null;
      }
    } catch (error) {
      console.error('Error in image request:', error);
      return null;
    }
  };


  const editReportDescription = async (newDescription) => {
    // Verifica si el usuario actual es el propietario del reporte

    console.log("Valor AAA:", selectedReport);
    console.log("Valor BBBB", selectedReport.user);
    console.log("Valor CCCC", userDNI);
    console.log("La comparación es:", selectedReport.user == userDNI);


    if (selectedReport && selectedReport.user == userDNI) { // Aquí asumo que el DNI del usuario se almacena en userDNI
      // Realiza la edición del reporte aquí (por ejemplo, usando axios o una función de API).
      // Actualiza la descripción en el servidor.
      try {
        const response = await axios.put(`http://192.168.1.105:4000/api/edit-report/${selectedReport.id_evento}`, {
          description: newDescription,
        });
        if (response.data.success) {
          // Actualiza la descripción en el estado local.
          setSelectedReport({ ...selectedReport, descripcion: newDescription });
          // Cierra el modal de edición.
          setShowReportModal(false);
        } else {
          console.error('Error al editar el reporte en el servidor:', response);
        }
      } catch (error) {
        console.error('Error en la solicitud de edición del reporte:', error);
      }
    } else {
      console.log('El usuario actual no tiene permisos para editar este reporte.');
      // Puedes mostrar un mensaje de error o tomar otras acciones según tus necesidades.
    }
  };


  const removeReportedZoneFromState = (zone) => {
    setReportedZones((prevZones) =>
      prevZones.filter((prevZone) => prevZone.latitude !== zone.latitude || prevZone.longitude !== zone.longitude)
    );
  };


  // eliminar eventos 


  const handleDeleteEvent = async () => {
    try {
      // Lógica para eliminar el evento
      const response = await axios.delete(`http://192.168.1.105:4000/api/eliminar-evento/${selectedReport.id_evento}`);

      if (response.data.success) {
        // Actualiza la interfaz de usuario o realiza otras acciones según sea necesario
        console.log('Evento eliminado correctamente');

      } else {
        console.error('Error al eliminar el evento:', response.data.message);
      }
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
    }
  };





  const parseFecha = (fecha) => {
    const meses = {
      'Enero': 0,
      'Febrero': 1,
      'Marzo': 2,
      'Abril': 3,
      'Mayo': 4,
      'Junio': 5,
      'Julio': 6,
      'Agosto': 7,
      'Septiembre': 8,
      'Octubre': 9,
      'Noviembre': 10,
      'Diciembre': 11,
    };

    const { day, month, year } = fecha;
    const monthNumber = meses[month];

    // Create the date in ISO format
    const isoDate = new Date(`${year}-${monthNumber + 1}-${day}`);

    return isoDate.toISOString();
  };



  /// filtrado

  const filterEvents = async (filteredDate) => {
    try {
      const response = await axios.get(`http://192.168.1.105:4000/api/eventos`);
      const eventos = response.data.eventos;

      const fecha = parseFecha(filteredDate);

      const eventosFiltrados = eventos.filter((evento) => {
        const eventoDate = new Date(`${evento.ano}-${evento.mes}-${evento.dia}`);
        return eventoDate.toISOString().split('T')[0] === fecha.split('T')[0];
      });


      console.log(eventosFiltrados)
      setFilteredEvents(eventosFiltrados);
    } catch (error) {
      console.error('Error al obtener el evento:', error);
    }
  };














  useEffect(() => {
    fetchZonasConParametros();
  }, []);




  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (location && location.coords) {
          setCurrentMarkerLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setLocationInitialized(true);
        } else {
          console.error('Location.coords is null or undefined');
        }
      } catch (error) {
        console.error('Error al obtener la ubicación:', error);
      }
    })();
  }, []);

  useEffect(() => {

  }, [currentMarkerLocation]);

  useEffect(() => {

    if (currentMarkerLocation && fixedLocation) {
      const distance = getDistance(
        currentMarkerLocation.latitude,
        currentMarkerLocation.longitude,
        fixedLocation.latitude,
        fixedLocation.longitude
      );
      setInCurrentZone(distance <= 10);
      console.log('inCurrentZone:', distance <= 10);
    }
  }, [currentMarkerLocation, fixedLocation]);



  useEffect(() => {
    const fetchData = async () => {
      if (reportId) { // Asegúrate de que reportId esté definido
        console.log(reportId)
        try {
          const response = await fetchImageURL(reportId);
          if (response) {
            setExpandedPhoto(response);
          } else {
            console.error('La URL de la imagen no está disponible.');
          }
        } catch (error) {
          console.error("Error en la solicitud de la imagen:", error);
        }
      }
    };

    fetchData();
  }, [reportId]);



  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      if (location && location.coords) {
        setCurrentMarkerLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const distance = getDistance(
          location.coords.latitude,
          location.coords.longitude,
          location.coords.latitude,
          location.coords.longitude
        );
        setInCurrentZone(distance <= 10);
      } else {
        console.error('Location.coords is null or undefined');
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  };


  /* Cuidado */

  useEffect(() => {
    filterEvents();
  }, [selectedYear, selectedMonth]);

/*
  useEffect(() => {
    if (filteredEvents.length > 0) {
      mapRef.current.fitToCoordinates(
        filteredEvents.map((evento) => ({
          latitude: parseFloat(evento.x),
          longitude: parseFloat(evento.y),
        })),
        { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
      );
    }
  }, [filteredEvents]);
  
*/

  /* Reporte completo foto, descripcion, usuario*/
  const takePicture = async () => {
    if (!currentMarkerLocation) {
      console.error('currentMarkerLocation is null or undefined');
      return;
    }

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const formData = new FormData();
        formData.append('photo', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });

        formData.append('latitude', currentMarkerLocation.latitude.toString());
        formData.append('longitude', currentMarkerLocation.longitude.toString());
        formData.append('description', description);
        formData.append('dni', dni);

        let zonaAzul = null;
        for (const zona of zonasConParametros) {
          const distance = getDistance(
            currentMarkerLocation.latitude,
            currentMarkerLocation.longitude,
            parseFloat(zona.latitude),
            parseFloat(zona.longitude)
          );

          if (distance <= 1000) {
            zonaAzul = zona;
            break;
          }
        }

        if (zonaAzul && zonaAzul.id_zona) {
          formData.append('zonaNombre', zonaAzul.nombre_zona);
          formData.append('id_zona', zonaAzul.id_zona.toString());
        } else {
          console.warn('ZonaAzul not found or id_zona is undefined. Make sure your data is correct.');
        }

        try {
          const response = await axios.post('http://192.168.1.105:4000/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success) {
            const newReportedZone = {
              latitude: currentMarkerLocation.latitude,
              longitude: currentMarkerLocation.longitude,
              //userDNI: dni,
            };
            console.log(dni)
            setReportedZones((prevZones) => [...prevZones, newReportedZone]);
          }


        } catch (error) {
          console.error('Error al subir la foto al servidor:', error);
        }
      } catch (error) {
        console.error('Error al tomar la foto:', error);
      }
    }
  };

  /*  sistema de login */
  const handleLoginSuccess = (token, userDNI) => {
    setIsLoggedIn(true);
    setDNI(userDNI);
    setUserDNI(userDNI); // Establece el usuario actual.
  };


  /* informacion de la zona reportada */

  const handleMarkerPress = async (zone) => {
    console.log("Ayudita", zone);
    try {
      const response = await axios.get(`http://192.168.1.105:4000/api/eventos`);
      console.log("Eventos:", response.data.eventos);

      // Recorre los eventos en la respuesta para comparar las coordenadas
      for (const evento of response.data.eventos) {
        if (
          parseFloat(evento.x) === zone.latitude &&
          parseFloat(evento.y) === zone.longitude
        ) {
          console.log("Evento encontrado:", evento);

          setReportId(evento.id_evento);

          setSelectedReport({
            id_evento: evento.id_evento,
            user: evento.dni,
            descripcion: evento.descripcion,
            ano: evento.ano,
            mes: evento.mes,
            dia: evento.dia,
            latitude: evento.x,
            longitude: evento.y,
          });

          // Add debugging statements
          console.log("selectedReport:", selectedReport);
          console.log("userDNI:", userDNI);

          setShowReportModal(true);
          break;
        }
      }
    } catch (error) {
      console.error('Error al obtener el evento:', error);
    }
  };





  /* calculo matematico para la ubicacion del usuario */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 10;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  if (!locationInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando App ....</Text>
      </View>
    );
  }

  /* renderizado  */
  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: -16.3990067,
            longitude: -71.5371297,
            latitudeDelta: 0.030,
            longitudeDelta: 0.030,
          }}
        >

          {currentMarkerLocation && (
            <Marker
              coordinate={currentMarkerLocation}
              draggable={true}
              onDragEnd={(e) => {
                setCurrentMarkerLocation({
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                });
              }}
              pinColor="red"
              title="Ubicación Actual"
            />
          )}

          {reportedZones

            //.filter(zone => zone.userDNI === userDNI)
            .map((zone, index) => (

              zone && zone.latitude && zone.longitude ? (
                <React.Fragment key={index}>
                  <Marker
                    coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
                    pinColor="purple"
                    title="Zona Reportada"
                    onPress={() => handleMarkerPress(zone)}
                  >
                    <Callout>
                      <Text>Zona Reportada</Text>
                    </Callout>
                  </Marker>
                  <Circle
                    center={{ latitude: zone.latitude, longitude: zone.longitude }}
                    radius={100}
                    fillColor="rgba(255, 0, 0, 0.2)"
                    strokeColor="red"
                  />
                </React.Fragment>
              ) : null


            ))}



          {zonasConParametros.map((zona, index) => (
            zona && zona.latitude && zona.longitude ? (
              <React.Fragment key={index}>
                <Circle
                  center={{ latitude: zona.latitude, longitude: zona.longitude }}
                  radius={100}
                  fillColor="rgba(0, 0, 255, 0.5)"
                  strokeColor="blue"
                />
              </React.Fragment>
            ) : null
          ))}

          {currentMarkerLocation && (
            <Circle center={currentMarkerLocation} radius={1000} />
          )}


        </MapView>


      ) : (
        <Login onLogin={handleLoginSuccess} />
      )}

      {isLoggedIn && inCurrentZone && (
        <View style={styles.buttonContainer}>
          <Button title="Reportar Zona" onPress={() => setShowCamera(true)} />
        </View>
      )}

      {isLoggedIn && (
        <View style={styles.currentLocationButtonContainer}>
          <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
            <Text style={styles.currentLocationButtonText}>Mi Ubicación</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoggedIn && (
        <View style={styles.filterButtonContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFiltroModal(true)}>
            <Text style={styles.filterButtonText}>Filtrar</Text>
          </TouchableOpacity>
        </View>
      )}















      {showCamera && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
        >
          <View style={styles.cameraButtonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cameraCaptureButton} onPress={takePicture}>
                <Text style={styles.cameraCaptureButtonText}>Tomar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraCloseButton} onPress={() => setShowCamera(false)}>
                <Text style={styles.cameraCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Añadir descripción"
              onChangeText={(text) => setDescription(text)}
              value={description}
            />
          </View>
        </Camera>
      )}



      {showReportModal && selectedReport && (
        <View style={[styles.reportModal, styles.centeredModal]}>
          {(selectedReport.user == userDNI || userDNI == 123) && (
            <Text style={styles.reportModalText}>Usuario: {selectedReport.user || 'N/A'}</Text>
          )}
          <Text style={styles.reportModalText}>
            {selectedReport.location && selectedReport.location.latitude && selectedReport.location.longitude && (
              `Ubicación: ${selectedReport.location.latitude}, ${selectedReport.location.longitude}`
            )}
          </Text>
          <Text style={[styles.reportModalText, { marginTop: -30 }]}>Descripción: {selectedReport.descripcion || 'Basura'}</Text>

          <Text style={[styles.reportModalText, { marginTop: -1 }]}>Fecha: {selectedReport.dia + ' / ' + selectedReport.mes + ' / ' + selectedReport.ano}</Text>

          <TouchableOpacity
            style={styles.expandPhotoButton}
            onPress={async () => {
              try {
                const response = await fetchImageURL(reportId);
                if (response) {
                  setExpandedPhoto(response);
                  setShowExpandedPhoto(true); // Show the modal
                } else {
                  console.error("Datos de imagen no válidos");
                }
              } catch (error) {
                console.error("Error pipipi:", error);
              }
            }}
          >
            <Text style={styles.expandPhotoButtonText}>Ampliar</Text>
          </TouchableOpacity>



          {(selectedReport.user == userDNI || userDNI == 123) && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditDescriptionMode(true)}
            >
              <Text style={styles.editDescriptionButtonText}>Editar Descripción</Text>
            </TouchableOpacity>
          )}

          {editDescriptionMode && (
            <EditDescriptionModal
              onCancel={() => setEditDescriptionMode(false)}
              onSave={(newDescription) => {
                setEditDescriptionMode(false);
                editReportDescription(newDescription);
              }}
              initialValue={selectedReport.descripcion}
            />
          )}


          {userDNI == 123 && (
            <TouchableOpacity
              style={styles.deleteEventButton}
              onPress={() => {
                handleDeleteEvent();
                setShowReportModal(false);

              }}
            >
              <Text style={styles.deleteEventButtonText}>Eliminar Evento</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeReportModalButton}
            onPress={() => setShowReportModal(false)}
          >
            <Text style={styles.closeReportModalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}

      {showFiltroModal && (
        <FiltroModal
          isVisible={showFiltroModal}
          onClose={() => setShowFiltroModal(false)}
          onApplyFilter={(selectedDate) => {
            filterEvents(selectedDate);
            setShowFiltroModal(false);
          }}
        />
      )}




      <ExpandedPhoto
        visible={showExpandedPhoto}
        photo={expandedPhoto}
        onClose={() => setShowExpandedPhoto(false)} // Close the modal
      />
    </View>
  );
}

/*

      <FiltroModal
        isVisible={showFiltroModal}
        onClose={() => setShowFiltroModal(false)}
        onApplyFilter={() => {
          filterEvents();
          setShowFiltroModal(false);
        }}
      />

*/

/* estilos defindos  */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  camera: {
    flex: 1,
  },

  cameraCaptureButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cameraCaptureButtonText: {
    fontSize: 14,
    marginBottom: 0,
    color: 'black',
    textAlign: 'center'
  },
  cameraCloseButton: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cameraCloseButtonText: {
    fontSize: 14,
    marginTop: 0,
    color: 'black',
  },
  descriptionInput: {
    flex: 0.3,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    padding: 0,
    borderRadius: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModal: {
    position: 'absolute',
    top: '30%',  // Ajusta la posición vertical del modal
    left: 20,    // Ajusta la posición horizontal del modal
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },

  centeredModal: {
    alignItems: 'center',  // Centra el contenido horizontalmente
  },
  reportModalText: {
    marginBottom: 10,
  },
  closeReportModalButton: {
    marginTop: 10,      // Ajusta la distancia entre el texto y el botón de cerrar
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  closeReportModalButtonText: {
    color: 'white',
    textAlign: 'center',
  },

  currentLocationButtonContainer: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  currentLocationButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  currentLocationButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  expandPhotoButton: {
    backgroundColor: '#3498db',
    marginTop: 3,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: 'yellow',
    marginTop: 8,
    marginBottom: 0,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  deleteEventButton: {
    backgroundColor: '#c0392b',
    padding: 10,
    marginTop: 8,
    marginBottom: 0,
    borderRadius: 10,
  },
  deleteEventButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  filterButtonContainer: {
    position: 'absolute',
    top: 10, // Ajusta la posición superior según tus necesidades
    left: 10, // Ajusta la posición izquierda según tus necesidades
    zIndex: 1, // Asegura que el botón esté en la parte superior del mapa
    marginTop: 25
  },
  filterButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    padding: 10,
    borderRadius: 5,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16, // Ajusta el tamaño del texto según tus necesidades
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cameraCaptureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Blanco semitransparente
    padding: 10,
    borderRadius: 5,
  },
  cameraCloseButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)', // Rojo semitransparente
    padding: 10,
    borderRadius: 5,
  },


});