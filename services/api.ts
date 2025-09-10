interface Order {
  id: string;
  reference?: string;
  status?: string;
  customer_name?: string;
  created_at?: string;
}

interface ApiResponse {
  count: number;
  current_page?: number;
  total_pages?: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

interface ScanUploadResponse {
  success: boolean;
  order: string;
  company: string;
  user: number;
  cloudinary: {
    public_id: string;
    url: string;
    format: string;
    size_kb: number;
    bytes: number;
    created_at: string;
  };
  log_id: number;
  action_preview: string;
}

interface Company {
  company__slug: string;
  company__name: string;
  company__logo: string;
}

interface CompaniesResponse {
  companies: Company[];
}

interface LoginResponse {
  user: any;
  token: string;
  status: number;
}

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export const searchOrders = async (code: string, token: string, baseUrl: string = 'https://api.tiktak.space'): Promise<Order[]> => {
  console.log(`🚀 Début de recherche pour le code: "${code}" sur ${baseUrl}`);
  console.log(`🔑 Token présent: ${token ? 'Oui' : 'Non'}`);
  
  try {
    // Utiliser le code scanné directement comme transport_system_id_in
    const url = `${baseUrl}/api/v1/orders/?transport_system_id_in=${encodeURIComponent(code)}`;
    console.log(`🔍 Recherche avec transport_system_id_in: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Réponse API - Status: ${response.status}`);

    if (response.status === 401 || response.status === 403) {
      throw new Error('Token invalide ou expiré. Mettez à jour le token dans Configuration.');
    }

    if (response.status >= 500) {
      throw new Error('Service momentanément indisponible. Réessayez.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Erreur API:`, errorData);
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    console.log('📦 Réponse API complète:', JSON.stringify(data, null, 2));
    
    // Vérifier si on a des résultats dans le format attendu
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      console.log(`✅ Trouvé ${data.results.length} commande(s)`);
      console.log('🎯 Première commande:', data.results[0]);
      return data.results;
    } else {
      console.log(`⚠️ Aucun résultat - count: ${data.count}, results: ${data.results?.length || 0}`);
      return [];
    }
  } catch (error: any) {
    console.log(`❌ Erreur lors de la recherche:`, error.message);
    throw error;
  }
};

export const uploadScan = async (
  orderId: string | number,
  imageUri: string,
  token: string,
  baseUrl?: string
): Promise<ScanUploadResponse> => {
  if (!imageUri) throw new Error("Image manquante");

  const apiBase = (baseUrl || "https://api.tiktak.space").replace(/\/$/, "");

  // Déduis un nom + mime corrects
  const fileName = imageUri.split("/").pop() || `scan_${orderId}.jpg`;
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mime =
    ext === "png" ? "image/png" :
    ext === "webp" ? "image/webp" :
    "image/jpeg";

  console.log(`📤 Upload scan pour commande: ${orderId}`);
  console.log(`📷 Image: ${fileName} (${mime})`);

  // ⚠️ En React Native, on doit passer un "RN file" { uri, name, type }
  const file: any = { uri: imageUri, name: fileName, type: mime };

  const form = new FormData();
  form.append("order", String(orderId));    // texte
  form.append("file", file);                // fichier

  console.log(`🚀 Envoi vers: ${apiBase}/api/v1/scan-upload/`);

  const res = await fetch(`${apiBase}/api/v1/scan-upload/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      // IMPORTANT: ne PAS fixer Content-Type ici -> RN ajoute le boundary
    },
    body: form,
  });

  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* texte d'erreur brut */ }

  console.log(`📡 Réponse: ${res.status} - ${text.substring(0, 200)}`);

  if (!res.ok) {
    // Remonte proprement le message DRF (ex: "La donnée soumise n'est pas un fichier...")
    const msg = (json && (json.detail || json.error || json.file?.[0])) ||
                (Array.isArray(json) ? json.join(", ") : text) ||
                `HTTP ${res.status}`;
    throw new Error(msg);
  }

  console.log(`✅ Upload réussi:`, json);
  return json; // attendu: { success, cloudinary:{url...}, ... }
};

export const getCompaniesByEmail = async (email: string, baseUrl: string = 'http://api.tiktak.space'): Promise<Company[]> => {
  console.log(`🏢 Recherche des sociétés pour: ${email}`);
  
  const url = `${baseUrl}/api/v1/get-comapnies-by-email/`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  console.log(`📡 Réponse API - Status: ${response.status}`);

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error('Service momentanément indisponible. Réessayez.');
    }
    throw new Error('Impossible de vérifier l\'e-mail. Vérifiez votre connexion.');
  }

  const data: CompaniesResponse = await response.json();
  console.log(`✅ Trouvé ${data.companies?.length || 0} société(s)`);
  
  return data.companies || [];
};

export const loginMobile = async (
  email: string, 
  password: string, 
  slug: string, 
  baseUrl: string = 'http://api.tiktak.space'
): Promise<LoginResponse> => {
  console.log(`🔐 Tentative de connexion pour: ${email} sur ${slug}`);
  
  const url = `${baseUrl}/api/v1/login-mobile/`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, slug }),
  });

  console.log(`📡 Réponse API - Status: ${response.status}`);

  const data = await response.json();

  if (!response.ok || data.status !== 200) {
    if (response.status === 401 || response.status === 400) {
      throw new Error('E-mail ou mot de passe incorrect. Veuillez réessayer.');
    }
    throw new Error('Connexion impossible pour le moment.');
  }

  console.log(`✅ Connexion réussie pour: ${email}`);
  return data;
};