const metrics = [
  {
    value: "5K+",
    label: "Weekly active users"
  },
  {
    value: "98%",
    label: "Customer satisfaction"
  },
  {
    value: "24h",
    label: "Average response time"
  }
];

const MetricsSection = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#14142B]">
            Trusted by researchers and product teams
          </h2>
          <p className="text-xl text-[#666675]">
            Join thousands of researchers making better product decisions 
          </p>
        </div>

        <div className="p-16 bg-[#F0EEFF] rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <p className="text-5xl md:text-6xl font-semibold text-[#4D4E99] mb-2">
                  {metric.value}
                </p>
                <p className="text-lg font-medium text-[#212280]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection; 