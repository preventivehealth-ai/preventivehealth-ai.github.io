/**
 * Cloudflare Worker: WhatsApp Redirect Handler
 *
 * Purpose: Handle same-origin redirect to WhatsApp to bypass COOP/CSP restrictions
 * Route: pages.preventivehealth.ai/api/whatsapp-redirect
 *
 * How it works:
 * 1. Receives request with token query parameter
 * 2. Validates token is present
 * 3. Constructs WhatsApp deep link with /join command
 * 4. Returns HTTP 302 redirect to WhatsApp
 *
 * This bypasses browser COOP/CSP policies because:
 * - Initial navigation is same-origin (pages.preventivehealth.ai -> pages.preventivehealth.ai)
 * - Server-side HTTP redirects are not subject to same COOP/CSP restrictions as client-side navigation
 */

export default {
  async fetch(request, env, ctx) {
    try {
      // Parse URL and extract token
      const url = new URL(request.url);
      const token = url.searchParams.get('token');

      // Validate token is present
      if (!token) {
        return new Response('Missing token parameter', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }

      // Validate token format (basic UUID check)
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_REGEX.test(token)) {
        return new Response('Invalid token format', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }

      // Construct WhatsApp deep link
      const WHATSAPP_NUMBER = '918793070914';
      const message = `/join ${token}`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      // Return HTTP 302 redirect to WhatsApp
      return Response.redirect(whatsappUrl, 302);

    } catch (error) {
      // Handle any unexpected errors
      console.error('Worker error:', error);
      return new Response('Internal server error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};
