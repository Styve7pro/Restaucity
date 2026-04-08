// Données des restaurants - Modifiez ce fichier pour ajouter/modifier des restaurants

export const restaurants = [
  {
    id: 1,
    name: "Le Gourmet Parisien",
    cuisine: "Français",
    address: "15 Rue de la Paix, 75002 Paris",
    phone: "+33 1 42 96 89 70",
    image: "/elegant-french-restaurant.png",
    rating: 4.8,
    reviews: 245,
    distance: "1.2 km",
    priceRange: "€€€",
    isOpen: true,
    badge: "Populaire",
    hours: {
      lundi: "12:00 - 14:30, 19:00 - 22:30",
      mardi: "12:00 - 14:30, 19:00 - 22:30",
      mercredi: "12:00 - 14:30, 19:00 - 22:30",
      jeudi: "12:00 - 14:30, 19:00 - 22:30",
      vendredi: "12:00 - 14:30, 19:00 - 23:00",
      samedi: "12:00 - 14:30, 19:00 - 23:00",
      dimanche: "Fermé",
    },
    description: "Restaurant gastronomique français proposant une cuisine raffinée dans un cadre élégant.",
    menu: [
      {
        category: "Entrées",
        items: [
          { name: "Foie Gras Maison", price: 18, description: "Foie gras mi-cuit, chutney de figues" },
          { name: "Tartare de Saumon", price: 16, description: "Saumon frais, avocat, citron vert" },
          { name: "Soupe à l'Oignon", price: 12, description: "Gratinée au fromage" },
        ],
      },
      {
        category: "Plats",
        items: [
          { name: "Bœuf Bourguignon", price: 28, description: "Mijoté au vin rouge, légumes de saison" },
          { name: "Magret de Canard", price: 26, description: "Sauce aux fruits rouges, purée maison" },
          { name: "Sole Meunière", price: 32, description: "Beurre citronné, pommes vapeur" },
        ],
      },
      {
        category: "Desserts",
        items: [
          { name: "Tarte Tatin", price: 10, description: "Pommes caramélisées, glace vanille" },
          { name: "Crème Brûlée", price: 9, description: "Vanille de Madagascar" },
          { name: "Profiteroles", price: 11, description: "Choux, glace vanille, sauce chocolat" },
        ],
      },
    ],
    coordinates: { lat: 48.8698, lng: 2.3314 },
  },
  {
    id: 2,
    name: "Bella Italia",
    cuisine: "Italien",
    address: "28 Avenue des Champs-��lysées, 75008 Paris",
    phone: "+33 1 45 62 53 84",
    image: "/cozy-italian-restaurant-pizza-pasta.jpg",
    rating: 4.6,
    reviews: 189,
    distance: "2.5 km",
    priceRange: "€€",
    isOpen: true,
    badge: "Nouveau",
    hours: {
      lundi: "11:30 - 15:00, 18:30 - 23:00",
      mardi: "11:30 - 15:00, 18:30 - 23:00",
      mercredi: "11:30 - 15:00, 18:30 - 23:00",
      jeudi: "11:30 - 15:00, 18:30 - 23:00",
      vendredi: "11:30 - 15:00, 18:30 - 23:30",
      samedi: "11:30 - 15:00, 18:30 - 23:30",
      dimanche: "11:30 - 15:00, 18:30 - 22:30",
    },
    description: "Trattoria authentique servant des pizzas au feu de bois et des pâtes fraîches maison.",
    menu: [
      {
        category: "Antipasti",
        items: [
          { name: "Bruschetta", price: 8, description: "Tomates fraîches, basilic, huile d'olive" },
          { name: "Carpaccio di Manzo", price: 14, description: "Bœuf cru, roquette, parmesan" },
          { name: "Burrata", price: 12, description: "Mozzarella crémeuse, tomates cerises" },
        ],
      },
      {
        category: "Pizzas",
        items: [
          { name: "Margherita", price: 13, description: "Tomate, mozzarella, basilic" },
          { name: "Quattro Formaggi", price: 16, description: "Quatre fromages italiens" },
          { name: "Diavola", price: 15, description: "Tomate, mozzarella, salami piquant" },
        ],
      },
      {
        category: "Pasta",
        items: [
          { name: "Carbonara", price: 14, description: "Pâtes fraîches, guanciale, pecorino" },
          { name: "Lasagne", price: 15, description: "Bolognaise maison, béchamel" },
          { name: "Ravioli Ricotta", price: 16, description: "Sauce tomate basilic" },
        ],
      },
      {
        category: "Dolci",
        items: [
          { name: "Tiramisu", price: 8, description: "Mascarpone, café, cacao" },
          { name: "Panna Cotta", price: 7, description: "Coulis de fruits rouges" },
        ],
      },
    ],
    coordinates: { lat: 48.8738, lng: 2.295 },
  },
  {
    id: 3,
    name: "Sakura Sushi",
    cuisine: "Japonais",
    address: "42 Rue Saint-Anne, 75002 Paris",
    phone: "+33 1 42 61 93 87",
    image: "/modern-japanese-sushi-restaurant.png",
    rating: 4.9,
    reviews: 312,
    distance: "0.8 km",
    priceRange: "€€€",
    isOpen: false,
    badge: "Top Chef",
    hours: {
      lundi: "Fermé",
      mardi: "12:00 - 14:30, 19:00 - 22:30",
      mercredi: "12:00 - 14:30, 19:00 - 22:30",
      jeudi: "12:00 - 14:30, 19:00 - 22:30",
      vendredi: "12:00 - 14:30, 19:00 - 23:00",
      samedi: "12:00 - 14:30, 19:00 - 23:00",
      dimanche: "12:00 - 14:30, 19:00 - 22:00",
    },
    description: "Restaurant japonais haut de gamme spécialisé dans les sushis et sashimis ultra-frais.",
    menu: [
      {
        category: "Entrées",
        items: [
          { name: "Edamame", price: 6, description: "Fèves de soja grillées au sel" },
          { name: "Gyoza", price: 9, description: "Raviolis japonais frits" },
          { name: "Salade Wakame", price: 7, description: "Algues marinées au sésame" },
        ],
      },
      {
        category: "Sushi & Sashimi",
        items: [
          { name: "Assortiment Sushi", price: 28, description: "12 pièces variées" },
          { name: "Sashimi Premium", price: 35, description: "Sélection du chef" },
          { name: "Chirashi", price: 24, description: "Bol de riz, poissons variés" },
        ],
      },
      {
        category: "Plats Chauds",
        items: [
          { name: "Ramen Tonkotsu", price: 16, description: "Bouillon porc, nouilles, œuf" },
          { name: "Tempura Mixte", price: 18, description: "Crevettes et légumes frits" },
          { name: "Teriyaki Saumon", price: 22, description: "Saumon grillé, sauce teriyaki" },
        ],
      },
      {
        category: "Desserts",
        items: [
          { name: "Mochi", price: 7, description: "Glace enrobée de pâte de riz" },
          { name: "Dorayaki", price: 6, description: "Pancakes fourrés à la pâte de haricots rouges" },
        ],
      },
    ],
    coordinates: { lat: 48.8682, lng: 2.335 },
  },
  {
    id: 4,
    name: "Le Bistrot du Coin",
    cuisine: "Français",
    address: "7 Rue du Faubourg Montmartre, 75009 Paris",
    phone: "+33 1 47 70 67 31",
    image: "/traditional-french-bistro-terrace.jpg",
    rating: 4.5,
    reviews: 156,
    distance: "1.8 km",
    priceRange: "€€",
    isOpen: true,
    hours: {
      lundi: "12:00 - 15:00, 19:00 - 23:00",
      mardi: "12:00 - 15:00, 19:00 - 23:00",
      mercredi: "12:00 - 15:00, 19:00 - 23:00",
      jeudi: "12:00 - 15:00, 19:00 - 23:00",
      vendredi: "12:00 - 15:00, 19:00 - 23:30",
      samedi: "12:00 - 15:00, 19:00 - 23:30",
      dimanche: "12:00 - 15:00, 19:00 - 22:00",
    },
    description: "Bistrot traditionnel parisien avec terrasse, ambiance conviviale et cuisine de bistrot.",
    menu: [
      {
        category: "Entrées",
        items: [
          { name: "Œuf Mayonnaise", price: 7, description: "Classique du bistrot" },
          { name: "Terrine Maison", price: 9, description: "Cornichons, pain grillé" },
          { name: "Salade de Chèvre Chaud", price: 11, description: "Toasts, miel, noix" },
        ],
      },
      {
        category: "Plats",
        items: [
          { name: "Steak Frites", price: 18, description: "Entrecôte, frites maison" },
          { name: "Confit de Canard", price: 19, description: "Pommes sarladaises" },
          { name: "Blanquette de Veau", price: 17, description: "Riz pilaf" },
        ],
      },
      {
        category: "Desserts",
        items: [
          { name: "Mousse au Chocolat", price: 7, description: "Maison" },
          { name: "Île Flottante", price: 6, description: "Crème anglaise" },
        ],
      },
    ],
    coordinates: { lat: 48.872, lng: 2.342 },
  },
  {
    id: 5,
    name: "Taj Mahal",
    cuisine: "Indien",
    address: "52 Rue Sainte-Anne, 75002 Paris",
    phone: "+33 1 42 96 22 07",
    image: "/indian-restaurant-curry-spices.jpg",
    rating: 4.7,
    reviews: 203,
    distance: "1.5 km",
    priceRange: "€€",
    isOpen: true,
    hours: {
      lundi: "12:00 - 14:30, 19:00 - 23:00",
      mardi: "12:00 - 14:30, 19:00 - 23:00",
      mercredi: "12:00 - 14:30, 19:00 - 23:00",
      jeudi: "12:00 - 14:30, 19:00 - 23:00",
      vendredi: "12:00 - 14:30, 19:00 - 23:30",
      samedi: "12:00 - 14:30, 19:00 - 23:30",
      dimanche: "12:00 - 14:30, 19:00 - 23:00",
    },
    description: "Restaurant indien authentique proposant des currys parfumés et des tandooris savoureux.",
    menu: [
      {
        category: "Entrées",
        items: [
          { name: "Samosas", price: 6, description: "Beignets farcis aux légumes" },
          { name: "Pakoras", price: 7, description: "Beignets de légumes épicés" },
          { name: "Naan Fromage", price: 5, description: "Pain indien au fromage" },
        ],
      },
      {
        category: "Plats",
        items: [
          { name: "Chicken Tikka Masala", price: 15, description: "Poulet mariné, sauce crémeuse" },
          { name: "Lamb Vindaloo", price: 17, description: "Agneau épicé, curry fort" },
          { name: "Palak Paneer", price: 14, description: "Fromage indien, épinards" },
        ],
      },
      {
        category: "Desserts",
        items: [
          { name: "Gulab Jamun", price: 6, description: "Boulettes sucrées au sirop" },
          { name: "Kulfi", price: 5, description: "Glace indienne pistache" },
        ],
      },
    ],
    coordinates: { lat: 48.869, lng: 2.336 },
  },
  {
    id: 6,
    name: "El Tapas Bar",
    cuisine: "Espagnol",
    address: "18 Rue de la Huchette, 75005 Paris",
    phone: "+33 1 43 54 89 47",
    image: "/spanish-tapas-bar-paella.jpg",
    rating: 4.4,
    reviews: 178,
    distance: "2.1 km",
    priceRange: "€€",
    isOpen: true,
    badge: "Ambiance",
    hours: {
      lundi: "18:00 - 00:00",
      mardi: "18:00 - 00:00",
      mercredi: "18:00 - 00:00",
      jeudi: "18:00 - 01:00",
      vendredi: "18:00 - 02:00",
      samedi: "18:00 - 02:00",
      dimanche: "18:00 - 00:00",
    },
    description: "Bar à tapas animé avec ambiance festive, sangria maison et spécialités espagnoles.",
    menu: [
      {
        category: "Tapas Froides",
        items: [
          { name: "Jamón Ibérico", price: 12, description: "Jambon ibérique 24 mois" },
          { name: "Manchego", price: 9, description: "Fromage de brebis" },
          { name: "Olives Marinées", price: 5, description: "Sélection d'olives" },
        ],
      },
      {
        category: "Tapas Chaudes",
        items: [
          { name: "Patatas Bravas", price: 7, description: "Pommes de terre, sauce piquante" },
          { name: "Gambas al Ajillo", price: 11, description: "Crevettes à l'ail" },
          { name: "Croquetas", price: 8, description: "Croquettes jambon" },
        ],
      },
      {
        category: "Plats",
        items: [
          { name: "Paella Mixte", price: 18, description: "Fruits de mer, poulet, riz" },
          { name: "Tortilla Española", price: 9, description: "Omelette pommes de terre" },
        ],
      },
    ],
    coordinates: { lat: 48.853, lng: 2.345 },
  },
]

// Fonction pour obtenir un restaurant par ID
export const getRestaurantById = (id) => {
  return restaurants.find((restaurant) => restaurant.id === Number.parseInt(id))
}

// Fonction pour filtrer les restaurants
export const filterRestaurants = (searchTerm, filters) => {
  return restaurants.filter((restaurant) => {
    const matchesSearch =
      !searchTerm ||
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCuisine = !filters.cuisine || restaurant.cuisine === filters.cuisine
    const matchesPrice = !filters.priceRange || restaurant.priceRange === filters.priceRange
    const matchesRating = !filters.minRating || restaurant.rating >= filters.minRating
    const matchesOpen = !filters.openNow || restaurant.isOpen

    return matchesSearch && matchesCuisine && matchesPrice && matchesRating && matchesOpen
  })
}

// Types de cuisine disponibles
export const cuisineTypes = ["Français", "Italien", "Japonais", "Indien", "Espagnol", "Chinois", "Mexicain", "Libanais"]

// Gammes de prix
export const priceRanges = ["€", "€€", "€€€"]
