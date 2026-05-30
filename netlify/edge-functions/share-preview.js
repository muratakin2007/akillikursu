export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const projectParam = url.searchParams.get("p");

  // Sadece WhatsApp, Telegram, Facebook gibi botlar geldiğinde araya girer
  const isBot = /WhatsApp|TelegramBot|Twitterbot|facebookexternalhit|LinkedInBot/i.test(userAgent);

  if (isBot && projectParam) {
    try {
      // Sitenizdeki güncel projeler.json dosyasını okur
      const jsonUrl = `${url.origin}/projeler.json`;
      const response = await fetch(jsonUrl);
      const projects = await response.json();

      // URL'deki parametre ile JSON'daki proje adını eşleştirir
      const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
      const project = projects.find(p => normalize(p.adi) === normalize(projectParam));

      if (project) {
        // Botun göreceği dinamik HTML önizleme sayfasını anında oluşturur
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${project.adi}</title>
            <meta property="og:title" content="Akıllı Kürsü - ${project.adi}">
            <meta property="og:description" content="${project.aciklama}">
            <meta property="og:image" content="${url.origin}/icon.png">
            <meta property="og:type" content="website">
            <meta property="og:url" content="${request.url}">
          </head>
          <body>Yönlendiriliyorsunuz...</body>
          </html>
        `;
        return new Response(html, { headers: { "content-type": "text/html;charset=UTF-8" } });
      }
    } catch (e) {
      console.error("Önizleme oluşturulurken hata:", e);
    }
  }

  // Eğer gelen kişi normal bir kullanıcıysa (bot değilse) hiçbir şey yapma, 
  // normal sitenizi (?p=Bolbasv1.3 adresiyle) açmasını sağla.
  return context.next();
};

export const config = {
  path: "/",
};
