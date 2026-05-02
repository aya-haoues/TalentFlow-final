# test_ollama.py
import requests
import json

# Texte de CV fictif — couvre plusieurs domaines pour tester l'universalité
cv_test = """
Ahmed Ben Ali
ahmed@email.com | +216 22 333 444
Tunis, Tunisie

EXPÉRIENCE
Développeur Full Stack — Comunik CRM (2022-2024) — 2 ans
  - Développement d'applications web avec Laravel 10 et Vue.js
  - Base de données MongoDB et MySQL
  - Déploiement Docker sur AWS

Développeur Junior — StartupXYZ (2021-2022) — 1 an
  - API REST avec Node.js et Express
  - Frontend React.js

FORMATION
Licence en Génie Logiciel — FST Tunis — 2021

COMPÉTENCES
Laravel, Vue.js, React, Node.js, MongoDB, MySQL, Docker, Git, AWS

LANGUES
Français (courant), Anglais (professionnel), Arabe (natif)
"""

offre_test = {
    "titre": "Développeur Full Stack Laravel",
    "description": "Nous cherchons un développeur Laravel avec expérience MongoDB",
    "competences_requises": "Laravel, MongoDB, React, Docker",
    "experience_min": 2,
}

prompt = f"""
Tu es un expert RH senior. Tu vas d'abord extraire les informations du CV,
puis évaluer le candidat pour le poste.
Réponds UNIQUEMENT en JSON valide. Zéro texte avant ou après.

=== TEXTE BRUT DU CV ===
{cv_test}

=== POSTE À POURVOIR ===
Titre : {offre_test['titre']}
Description : {offre_test['description']}
Compétences requises : {offre_test['competences_requises']}
Expérience minimale : {offre_test['experience_min']} ans

=== ÉTAPE 1 : EXTRAIS ces informations du CV ===
- Nom du candidat
- Compétences et outils maîtrisés (TOUS, peu importe le domaine)
- Années d'expérience totales
- Postes occupés
- Diplômes et formations
- Langues

=== ÉTAPE 2 : ÉVALUE sur 100 points avec ce barème ===
- Compétences métier (40 pts)
- Expérience (25 pts)
- Formation (15 pts)
- Langues (10 pts)
- Cohérence parcours (10 pts)

=== FORMAT JSON ATTENDU ===
{{
  "extraction": {{
    "nom": "...",
    "competences": ["..."],
    "annees_experience": 0,
    "postes": ["..."],
    "formation": ["..."],
    "langues": ["..."]
  }},
  "score_global": 0,
  "niveau": "...",
  "scores_details": {{
    "competences_metier": {{"score": 0, "max": 40, "justification": "..."}},
    "experience":         {{"score": 0, "max": 25, "justification": "..."}},
    "formation":          {{"score": 0, "max": 15, "justification": "..."}},
    "langues":            {{"score": 0, "max": 10, "justification": "..."}},
    "coherence_parcours": {{"score": 0, "max": 10, "justification": "..."}}
  }},
  "points_forts":   ["..."],
  "points_faibles": ["..."],
  "resume":         "...",
  "decision":       "...",
  "risques":        ["..."]
}}
"""

print("Envoi du prompt à Ollama...")
print("-" * 50)

response = requests.post("http://localhost:11434/api/generate", json={
    "model":   "llama3.2",
    "prompt":  prompt,
    "stream":  False,
    "format":  "json",
    "options": {"temperature": 0.1},
})

raw = response.json().get("response", "")

print("Réponse brute d'Ollama :")
print(raw[:200], "...")  # affiche les 200 premiers chars
print("-" * 50)

# Parser et afficher proprement
try:
    result = json.loads(raw)
    print(f"Score global     : {result.get('score_global')}/100")
    print(f"Niveau           : {result.get('niveau')}")
    print(f"Decision         : {result.get('decision')}")
    print(f"Nom extrait      : {result.get('extraction', {}).get('nom')}")
    print(f"Competences      : {result.get('extraction', {}).get('competences')}")
    print(f"Resume           : {result.get('resume')}")
    print("\nScores par critere :")
    for critere, data in result.get("scores_details", {}).items():
        print(f"  {critere}: {data['score']}/{data['max']} — {data['justification']}")
    print("\nJSON COMPLET VALIDE")
except json.JSONDecodeError as e:
    print(f"ERREUR JSON : {e}")
    print("Ollama n'a pas retourné un JSON valide")