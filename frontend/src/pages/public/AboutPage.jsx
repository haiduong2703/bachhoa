import { Shield, Truck, Clock, Users, Award, Heart } from 'lucide-react'

const AboutPage = () => {
  const stats = [
    { label: 'Khách hàng hài lòng', value: '10,000+', icon: Users },
    { label: 'Sản phẩm chất lượng', value: '5,000+', icon: Award },
    { label: 'Năm kinh nghiệm', value: '15+', icon: Shield },
    { label: 'Đơn hàng mỗi ngày', value: '500+', icon: Truck }
  ]

  const values = [
    {
      icon: Shield,
      title: 'Chất lượng đảm bảo',
      description: 'Chúng tôi cam kết cung cấp những sản phẩm tươi ngon, chất lượng cao nhất từ các nhà cung cấp uy tín.'
    },
    {
      icon: Truck,
      title: 'Giao hàng nhanh chóng',
      description: 'Dịch vụ giao hàng tận nơi trong ngày, đảm bảo sản phẩm đến tay khách hàng trong tình trạng tốt nhất.'
    },
    {
      icon: Clock,
      title: 'Phục vụ 24/7',
      description: 'Website hoạt động 24/7, khách hàng có thể mua sắm bất cứ lúc nào, ở bất cứ đâu một cách tiện lợi.'
    },
    {
      icon: Heart,
      title: 'Tận tâm phục vụ',
      description: 'Đội ngũ nhân viên nhiệt tình, chu đáo, luôn sẵn sàng hỗ trợ khách hàng với thái độ thân thiện nhất.'
    }
  ]

  const team = [
    {
      name: 'Nguyễn Văn A',
      position: 'Giám đốc điều hành',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      description: '15 năm kinh nghiệm trong ngành bán lẻ thực phẩm'
    },
    {
      name: 'Trần Thị B',
      position: 'Trưởng phòng Marketing',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      description: 'Chuyên gia marketing với 10 năm kinh nghiệm'
    },
    {
      name: 'Lê Văn C',
      position: 'Trưởng phòng Kỹ thuật',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      description: 'Kỹ sư phần mềm với chuyên môn cao về e-commerce'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Về Bach Hoa Store
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Chúng tôi là cửa hàng bách hóa trực tuyến hàng đầu, cam kết mang đến cho khách hàng
            những sản phẩm tươi ngon, chất lượng cao với dịch vụ tận tâm nhất.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Câu chuyện của chúng tôi
              </h2>
              <p className="text-gray-600 text-lg">
                Hành trình từ một cửa hàng nhỏ đến nền tảng thương mại điện tử hàng đầu
              </p>
            </div>

            <div className="prose prose-lg mx-auto text-gray-700">
              <p>
                Bach Hoa Store được thành lập vào năm 2009 với mong muốn mang đến cho mọi gia đình Việt Nam
                những sản phẩm thực phẩm tươi ngon, chất lượng cao với giá cả hợp lý. Bắt đầu từ một cửa hàng
                nhỏ tại TP.HCM, chúng tôi đã không ngừng phát triển và mở rộng.
              </p>

              <p>
                Năm 2020, nhận thấy xu hướng mua sắm trực tuyến ngày càng phổ biến, chúng tôi đã quyết định
                chuyển đổi số và phát triển nền tảng thương mại điện tử. Với sự đầu tư mạnh mẽ vào công nghệ
                và logistics, Bach Hoa Store đã trở thành một trong những cửa hàng bách hóa trực tuyến
                được yêu thích nhất tại Việt Nam.
              </p>

              <p>
                Hôm nay, chúng tôi tự hào phục vụ hơn 10,000 khách hàng với hơn 5,000 sản phẩm đa dạng,
                từ thực phẩm tươi sống đến các mặt hàng tiêu dùng thiết yếu. Sứ mệnh của chúng tôi là
                "Mang đến sự tiện lợi và chất lượng cho mọi gia đình Việt Nam".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị mà chúng tôi luôn theo đuổi và thực hiện trong mọi hoạt động kinh doanh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Đội ngũ lãnh đạo
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những con người tài năng và tận tâm đang dẫn dắt Bach Hoa Store phát triển
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Cùng Bach Hoa Store xây dựng tương lai
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Chúng tôi luôn tìm kiếm những tài năng mới để cùng phát triển và mang đến
            những trải nghiệm tuyệt vời cho khách hàng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Liên hệ với chúng tôi
            </a>
            <a
              href="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-colors duration-200"
            >
              Khám phá sản phẩm
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
