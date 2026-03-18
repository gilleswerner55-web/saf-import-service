import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-primary/20 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-saf.png"
                alt="SAF"
                width={48}
                height={48}
                className="rounded"
              />
              <div>
                <h3 className="font-bold text-lg">Swiss Armsport Federation</h3>
                <p className="text-gray-400 text-sm">Offizieller Verband</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Der Schweizerische Armwrestling Verband organisiert und fördert den
              Armwrestling-Sport in der Schweiz.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/rankings" className="hover:text-primary transition-colors">
                  Rankings
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="hover:text-primary transition-colors">
                  Turniere
                </Link>
              </li>
              <li>
                <Link href="/clubs" className="hover:text-primary transition-colors">
                  Vereine
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Kontakt</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="mailto:info@swissarmsport.ch"
                  className="hover:text-primary transition-colors"
                >
                  info@swissarmsport.ch
                </a>
              </li>
              <li>
                <a
                  href="https://swissarmsport.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  swissarmsport.ch
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Swiss Armsport Federation. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  )
}
