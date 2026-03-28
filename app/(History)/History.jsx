import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Search, MessageCircle, Home, Tag, ClipboardList, User, Wallet, Coffee, Car, Bike } from 'lucide-react-native';

const DATA = [
  { id: '1', title: 'Dharma Coffee, Ubud', status: 'Delivered', time: 'Today, 3:39 PM', rating: '4.2', type: 'food' },
  { id: '2', title: 'Outpost Ubud Cliving', status: 'Delivered', time: 'Today, 3:49 PM', rating: '4.2', type: 'car' },
  { id: '3', title: 'Capucciano Coffee,Ubud', status: 'Delivered', time: 'Today, 3:39 PM', rating: '4.2', type: 'food' },
  { id: '4', title: 'Outpost Ubud Cliving', status: 'Delivered', time: 'Today, 3:49 PM', rating: '4.2', type: 'car' },
  { id: '5', title: 'Anomali Coffee,Ubud', status: 'Delivered', time: 'Today, 4:39 PM', rating: '4.2', type: 'food' },
];

const OrdersScreen = () => {
  const [activeSegment, setActiveSegment] = useState('History');
  const [activeCategory, setActiveCategory] = useState('All');

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.iconContainer}>
        {item.type === 'food' ? <Coffee size={20} color="#7F56D9" /> : <Car size={20} color="#7F56D9" />}
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderTitle}>{item.title}</Text>
        <Text style={styles.orderStatus}>
          <Text style={{ color: '#2D8A39', fontWeight: '600' }}>{item.status}</Text> • {item.time}
        </Text>
        <Text style={styles.orderRating}>You rated this ⭐ {item.rating}</Text>
      </View>
      <TouchableOpacity>
        <MessageCircle size={20} color="#7F56D9" style={styles.chatIcon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        {['History', 'Ongoing', 'Scheduled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveSegment(tab)}
            style={[styles.segmentButton, activeSegment === tab && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, activeSegment === tab && styles.segmentTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryBar}>
        {['All', 'Food', 'Car', 'Ride', 'Pay'].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        ListHeaderComponent={() => (
          <TouchableOpacity style={styles.promoCard}>
            <View style={styles.promoIcon}>
               <Wallet size={20} color="#7F56D9" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.promoTitle}>Pay Transactions</Text>
              <Text style={styles.promoSubtitle}>Enjoy extra benefits in your trip.</Text>
            </View>
            <Text style={{ color: '#999' }}>{'>'}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Bottom Nav Placeholder */}
      <View style={styles.bottomNav}>
        <NavItem icon={<Home size={24} color="#999" />} label="Home" />
        <NavItem icon={<Tag size={24} color="#999" />} label="Promo" />
        <NavItem icon={<ClipboardList size={24} color="#7F56D9" />} label="Orders" active />
        <NavItem icon={<MessageCircle size={24} color="#999" />} label="Chat" />
      </View>
    </SafeAreaView>
  );
};

const NavItem = ({ icon, label, active }) => (
  <TouchableOpacity style={styles.navItem}>
    {icon}
    <Text style={[styles.navLabel, active && { color: '#7F56D9' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  
  // Tabs
  segmentedControl: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  segmentButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  segmentButtonActive: { backgroundColor: '#333', borderColor: '#333' },
  segmentText: { color: '#888', fontWeight: '500' },
  segmentTextActive: { color: '#FFF' },

  // Categories
  categoryBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 10,
  },
  categoryTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryTabActive: { borderBottomWidth: 2, borderBottomColor: '#333' },
  categoryText: { color: '#888', fontSize: 14 },
  categoryTextActive: { color: '#000', fontWeight: 'bold' },

  // Promo Card
  promoCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F6FF',
    margin: 20,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  promoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBE9FE', justifyContent: 'center', alignItems: 'center' },
  promoTitle: { fontWeight: 'bold', color: '#333' },
  promoSubtitle: { color: '#777', fontSize: 12 },

  // List Items
  orderItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F7F6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetails: { flex: 1, marginLeft: 15 },
  orderTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  orderStatus: { fontSize: 13, color: '#666', marginTop: 2 },
  orderRating: { fontSize: 12, color: '#888', marginTop: 4 },
  chatIcon: { padding: 5, borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    height: 80,
    width: '100%',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 20,
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 11, color: '#999', marginTop: 4 }
});

export default OrdersScreen;


// import { StyleSheet, Text, View,SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
// import React, { useState } from 'react'

// const list=['History','Ongoing','Refunded'];
// const choice=['All','Food','Car','Ride','Pay'];


// const History = () => {
//     const [select,setselect]=useState(list[0])
//     const [selectchoice,setselectedchoice]=useState(choice[0])
  
//     return (
//     <SafeAreaView style={{flex:1,backgroundColor:'white'}}>

//       <View style={{backgroundColor:'white',
//       width:'100%',height:"15%",
//       justifyContent:'space-between',
//       borderColor:'rgba(215, 213, 213, 0.35)',
//       borderBottomWidth:1,}}>
//             <Text style={{marginLeft:15,fontSize:18}} >Orders</Text>

//           <View style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',margin:10}}>

//         {list.map((res,_)=>(
//             <TouchableOpacity onPress={()=>setselect(res)} key={_} style={{width:'30%',height:44,borderRadius:13,backgroundColor:select===res?'rgb(46, 46, 46)':'rgb(255, 255, 255)',
//             borderWidth:1,
//             borderColor:'rgb(214, 213, 213)',
//             justifyContent:'center',alignItems:'center'}}>
//                 <Text style={{color:select===res?'white':'black'}}>{res}</Text>
//             </TouchableOpacity>
//         ))}
//         </View>
//         <FlatList
//         data={choice}
//         horizontal
//         keyExtractor={(item)=>item}
//         contentContainerStyle={{width:"100%",justifyContent:'space-evenly',alignItems:'center'}}
//         renderItem={(({item})=>(
//             <TouchableOpacity onPress={()=>setselectedchoice(item)} style={{justifyContent:"space-between",alignItems:'center',top:2}}>
//                 <Text style={{color:selectchoice===item?'black':'rgba(1, 1, 1, 0.4)'}}>{item}</Text>
//                 <View style={{width:50,height:1.2,backgroundColor:selectchoice===item?'black':'',top:7}}/>
//             </TouchableOpacity>
//         ))}
//         />
//       </View>
//       <FlatList
//       data={[
//         {
//             id:0,
//             name:'pay Transactions',
//             desc:'Enjoy benefits in your trip',
//             status:'',
//             time:'',
//             rates:4.2
//         }
//       ]}
//       />
//     </SafeAreaView>
//   )
// }

// export default History

// const styles = StyleSheet.create({})