import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { api } from './src/api/client.js';
import BandeauEtat from './src/composants/BandeauEtat.jsx';
import Accueil from './src/pages/Accueil.jsx';
import Meteo from './src/pages/Meteo.jsx';
import Alertes from './src/pages/Alertes.jsx';
import Parcelles from './src/pages/Parcelles.jsx';
import Journal from './src/pages/Journal.jsx';
import Conseils from './src/pages/Conseils.jsx';
import TableauDeBord from './src/pages/TableauDeBord.jsx';

const Stack = createNativeStackNavigator();

export default function App() {
  const [langue, setLangue] = useState(api.langue);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    (async () => {
      await api.charger();                       // restaure token + langue
      api.abonnerLangue(setLangue);              // changement MG/FR -> remontage
      setLangue(api.langue);
      setPret(true);
    })();
  }, []);

  if (!pret) return null;                        // une seconde noire le temps du chargement

  return (
    <NavigationContainer key={langue}>
      <StatusBar style="light" />
      <BandeauEtat />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Accueil" component={Accueil} />
        <Stack.Screen name="Meteo" component={Meteo} />
        <Stack.Screen name="Alertes" component={Alertes} />
        <Stack.Screen name="Parcelles" component={Parcelles} />
        <Stack.Screen name="Journal" component={Journal} />
        <Stack.Screen name="Conseils" component={Conseils} />
        <Stack.Screen name="TableauDeBord" component={TableauDeBord} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
