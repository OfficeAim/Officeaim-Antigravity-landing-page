# Product Requirement Document (PRD)

**Projectnaam:** MakelaarVideo AI (Snelder Zijlstra)
**Doelmarkt:** Regio Twente, Nederland.
**Kernobjectief:** Automatisering van vastgoed PDF-brochures naar Facebook Reels via een 7-stappen Digitaal Brein (Make.com).

## Architectuur & Flow
1. **Webhook:** Ontvangt PDF URL en e-mailadres van de makelaar.
2. **HTTP:** Downloadt de brochure.
3. **CloudConvert:** Converteert PDF naar ruwe tekst.
4. **OpenAI #1 (Onderzoeker):** Extraheert Pand_Naam, m2, en energielabels.
5. **OpenAI #2 (Strateeg):** Genereert een 8-sectie script voor social media.
6. **Gmail:** Verstuurt script naar marketingteam.
7. **Google Sheets:** Logt operatie (Kolom C: Pand_Naam).