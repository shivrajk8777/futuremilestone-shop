export default function Terms() {
  return (
    <div className="space-y-12 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-border-accent pb-8">
        <span className="text-xs uppercase font-bold tracking-wider text-fg-secondary">Legal Information</span>
        <h1 className="font-dm-sans text-4xl font-bold tracking-tight text-fg-primary mt-2">Terms & Conditions</h1>
      </div>

      {/* Content */}
      <div className="text-sm text-fg-secondary leading-relaxed space-y-6">
        <p className="font-medium text-fg-primary">
          Welcome to Future Milestone. By using our website and purchasing our handcrafted Scandinavian furniture, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <section className="space-y-3">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">1. Intellectual Property</h2>
          <p>
            All content on this site, including but not limited to designs, text, graphics, logos, images, and software, is the property of Future Milestone Furniture Ltd. and is protected by international copyright laws. Any unauthorized reuse, modification, or distribution is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">2. Pricing and Availability</h2>
          <p>
            While we strive to ensure all prices and details shown on our website are accurate, errors may occasionally occur. If we discover an error in the pricing of a product you have ordered, we will notify you immediately and offer the choice to reconfirm the order at the correct price or cancel it.
          </p>
          <p>
            Furniture items are subject to availability. Stated delivery times for custom or backordered items are estimates and may occasionally face delays due to timber sourcing and logistics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">3. Custom Commissions</h2>
          <p>
            Orders placed for custom fabric configurations or personalized dimensions are hand-tailored to order. Once custom manufacturing begins (usually 48 hours after order placement), custom orders cannot be modified, cancelled, or returned.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">4. Limitation of Liability</h2>
          <p>
            Future Milestone Furniture Ltd. shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products, including wood warping due to exposure to extreme moisture or dry heating environments in customers' homes. Wood is a living material and should be cared for in accordance with our care guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Germany and the Czech Republic, and any disputes will be subject to the exclusive jurisdiction of the courts of Hamburg or Prague.
          </p>
        </section>
      </div>
    </div>
  );
}
