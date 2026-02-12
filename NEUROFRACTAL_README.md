# NeuroFractal Chat System

## Vue d'ensemble

NeuroFractal est un système de chat avancé basé sur l'IA qui utilise des algorithmes de fractales neuronales pour créer des interactions adaptatives et thérapeutiques. Le système apprend en continu des interactions utilisateurs pour optimiser les réponses et améliorer l'expérience cognitive.

## Architecture

### Composants Principaux

1. **EnhancedChat** - Interface utilisateur principale
2. **NeuroFractal API** - Gestion des sessions et états
3. **Security Module** - Chiffrement et audit trail
4. **Optimizer** - Adaptation automatique des paramètres
5. **Training Pipeline** - Apprentissage continu
6. **Monitoring Dashboard** - Métriques temps réel

### États NeuroFractal

Chaque interaction est caractérisée par trois dimensions principales :

- **Cohérence** (0-1) : Stabilité cognitive
- **Complexité** (0-1) : Niveau de détail adaptatif
- **Résonance** (0-1) : Harmonie émotionnelle

## Installation

```bash
# Installation des dépendances
npm install

# Configuration Supabase
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Migration de la base de données
npx supabase db push

# Démarrage du serveur de développement
npm run dev
```

## Configuration

### Variables d'environnement

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_NEURO_FRACTAL_ENCRYPTION_KEY=your_encryption_key
```

### Tables Supabase

Le système utilise les tables suivantes :

- `neuro_fractal_sessions` - Sessions utilisateur
- `neuro_fractal_states` - États cognitifs
- `neuro_fractal_messages` - Messages et métadonnées
- `neuro_fractal_metrics` - Métriques de performance
- `neuro_fractal_adaptations` - Adaptations apprises
- `neuro_fractal_training_data` - Données d'entraînement
- `neuro_fractal_models` - Versions de modèles

## API Reference

### Sessions

#### Créer une session
```typescript
const session = await createNeuroFractalSession({
  user_id: "user-123",
  session_name: "Thérapie Session 1"
});
```

#### Obtenir la session active
```typescript
const session = await getActiveSession("user-123");
```

### États

#### Créer un état
```typescript
const state = await createNeuroFractalState({
  session_id: "session-123",
  coherence: 0.85,
  complexity: 0.72,
  resonance: 0.91,
  adaptation_level: 0.65
});
```

#### Obtenir les états d'une session
```typescript
const states = await getSessionStates("session-123");
```

### Messages

#### Envoyer un message
```typescript
const message = await createNeuroFractalMessage({
  session_id: "session-123",
  user_id: "user-123",
  message_type: "user",
  content: "Bonjour, comment allez-vous ?",
  coherence_at_message: 0.8,
  complexity_at_message: 0.6,
  resonance_at_message: 0.7
});
```

### Métriques

#### Enregistrer une métrique
```typescript
await createNeuroFractalMetric({
  user_id: "user-123",
  session_id: "session-123",
  metric_type: "response_time",
  metric_value: 1.2,
  metric_metadata: { context: "therapeutic" }
});
```

## Sécurité

### Chiffrement

Toutes les données sensibles sont chiffrées avec AES-256 :

```typescript
import { NeuroFractalSecurity } from '@/lib/neuroFractalSecurity';

// Chiffrement
const encrypted = NeuroFractalSecurity.encryptNeuralState(sensitiveData);

// Déchiffrement
const decrypted = NeuroFractalSecurity.decryptNeuralState(encrypted);
```

### Audit Trail

Toutes les actions sont tracées :

```typescript
await NeuroFractalAudit.logAccess(
  userId,
  'read_session',
  'neuro_fractal_sessions',
  sessionId
);
```

## Optimisation

### Adaptation Automatique

Le système s'adapte automatiquement basé sur les métriques de performance :

```typescript
import { NeuroFractalOptimizer } from '@/lib/neuroFractalOptimizer';

const optimizedParams = await NeuroFractalOptimizer.optimizeParameters(
  sessionId,
  userId,
  currentMetrics,
  currentParams
);
```

### Règles d'Adaptation

- **Haute stabilité** → Augmente la complexité
- **Satisfaction faible** → Simplifie les réponses
- **Erreurs élevées** → Mode conservateur
- **Engagement élevé** → Améliore la résonance

## Formation IA

### Collecte de Données

```typescript
import { NeuroFractalTrainingPipeline } from '@/lib/neuroFractalTraining';

await NeuroFractalTrainingPipeline.collectTrainingData(
  userId,
  sessionId,
  messageContent,
  userState,
  aiResponse,
  aiState
);
```

### Apprentissage Continu

Le système apprend automatiquement quand suffisamment de données de qualité sont disponibles.

## Monitoring

### Dashboard

Accédez au dashboard de monitoring : `/neurofractal-dashboard`

### Métriques Clés

- Sessions actives
- Cohérence moyenne
- Taux d'erreur
- Points de données d'entraînement
- Santé du système

## Utilisation

### Démarrage d'une Session

1. Créer une session via l'API
2. Initialiser l'état NeuroFractal
3. Commencer le chat avec EnhancedChat

### Intégration dans l'App

```tsx
import EnhancedChat from '@/components/EnhancedChat';

function App() {
  return (
    <Routes>
      <Route path="/chat" element={<EnhancedChat />} />
      <Route path="/dashboard" element={<NeuroFractalDashboard />} />
    </Routes>
  );
}
```

## Tests

### Tests Unitaires

```bash
npm run test
```

### Tests d'Intégration

```bash
npm run test:integration
```

## Déploiement

### Production

```bash
# Build
npm run build

# Preview
npm run preview
```

### Variables de Production

Assurez-vous que toutes les variables d'environnement sont configurées en production.

## Support et Maintenance

### Logs

Les logs sont disponibles dans :
- Console du navigateur (dev)
- Supabase logs (production)
- Métriques NeuroFractal

### Alertes

Le système génère des alertes pour :
- Anomalies de sécurité
- Dégradation des performances
- Problèmes d'entraînement

### Mises à Jour

Le système se met à jour automatiquement via le pipeline d'entraînement continu.

## Conformité

### RGPD

- Chiffrement de bout en bout
- Anonymisation des données
- Droit à l'effacement
- Audit trail complet

### Sécurité

- Authentification Supabase
- Autorisation RLS
- Chiffrement AES-256
- Monitoring temps réel

## Performance

### Métriques Cibles

- Temps de réponse : < 2s
- Disponibilité : > 99.9%
- Précision du modèle : > 90%
- Satisfaction utilisateur : > 85%

### Optimisation

- Cache des états fréquents
- Optimisation des requêtes
- Compression des données
- Load balancing

## Roadmap

### Phase 1 (Actuelle)
- ✅ Chat de base NeuroFractal
- ✅ API Supabase
- ✅ Sécurité et audit
- ✅ Auto-optimisation
- ✅ Apprentissage continu
- ✅ Monitoring dashboard

### Phase 2 (Prochaine)
- Interface mobile
- Intégration vocale
- Analytics avancés
- Multi-langues
- API externe

### Phase 3 (Future)
- Thérapies spécialisées
- Intégration médicale
- Recherche collaborative
- API publique

## Contribution

### Développement

1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Push et créer une PR

### Standards de Code

- TypeScript strict
- Tests pour toute nouvelle fonctionnalité
- Documentation complète
- Revue de code obligatoire

## Licence

Propriétaire - Tous droits réservés.

## Support

Pour le support technique :
- Email : support@neurofractal.com
- Documentation : [Lien vers la doc complète]
- Issues : GitHub Issues

---

*NeuroFractal - Révolutionner l'interaction homme-machine par l'intelligence adaptative*
