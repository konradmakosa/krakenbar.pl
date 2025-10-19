#!/usr/bin/env python3
"""
Skrypt do automatycznego przeliczenia współrzędnych hotspotów
z błędnych wymiarów na poprawne
"""
import json

# Wymiary błędne (z edytora)
FOOD_OLD_HEIGHT = 13200
DRINKS_OLD_HEIGHT = 15300

# Wymiary poprawne (faktyczne)
FOOD_NEW_HEIGHT = 4700
DRINKS_NEW_HEIGHT = 7985

# Szerokość jest poprawna
WIDTH = 3000

def fix_hotspots(input_file, output_file, old_height, new_height):
    """Przelicz współrzędne hotspotów proporcjonalnie"""
    
    # Wczytaj dane
    with open(input_file, 'r', encoding='utf-8') as f:
        hotspots = json.load(f)
    
    # Oblicz współczynnik skalowania dla osi Y
    scale_y = new_height / old_height
    
    print(f"\n{'='*60}")
    print(f"Przetwarzanie: {input_file}")
    print(f"Stara wysokość: {old_height} px")
    print(f"Nowa wysokość: {new_height} px")
    print(f"Współczynnik skalowania Y: {scale_y:.4f}")
    print(f"{'='*60}\n")
    
    # Przelicz współrzędne
    fixed_hotspots = []
    for hotspot in hotspots:
        # X pozostaje bez zmian
        # Y musi być przeskalowane
        fixed = {
            "name": hotspot["name"],
            "id": hotspot["id"],
            "x1": hotspot["x1"],  # bez zmian
            "y1": round(hotspot["y1"] * scale_y),
            "x2": hotspot["x2"],  # bez zmian
            "y2": round(hotspot["y2"] * scale_y),
            "page": hotspot["page"],
            "description": hotspot.get("description", "")
        }
        
        print(f"{hotspot['name']:30} Y: {hotspot['y1']:5} → {fixed['y1']:5} | {hotspot['y2']:5} → {fixed['y2']:5}")
        fixed_hotspots.append(fixed)
    
    # Zapisz poprawione dane
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_hotspots, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Zapisano {len(fixed_hotspots)} hotspotów do: {output_file}\n")

if __name__ == '__main__':
    # Napraw hotspoty food
    fix_hotspots(
        'data/hotspots_food.json',
        'data/hotspots_food.json',
        FOOD_OLD_HEIGHT,
        FOOD_NEW_HEIGHT
    )
    
    # Napraw hotspoty drinks
    fix_hotspots(
        'data/hotspots_drinks.json',
        'data/hotspots_drinks.json',
        DRINKS_OLD_HEIGHT,
        DRINKS_NEW_HEIGHT
    )
    
    print("="*60)
    print("✓ Wszystkie hotspoty zostały poprawione!")
    print("="*60)
