import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

export default class MessageItem extends Component {
  render() {
    return (
      <TouchableHighlight
        onPress={()=>{this.props.navigation.navigate('Chat')}}
        underlayColor='#fff'
      >
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View
              style={{
                width:60,
                height:60,
                backgroundColor:'#eee',
                borderRadius:30,
              }}
            />
          </View>
          <View style={styles.itemRight}>
            <View style={styles.itemRightPart}>
              <Text style={{
                flex:1,
                color:'#666'
              }}>name</Text>
              <Text style={{
                width:40,
                color:'#666'
              }}>15:29</Text>
            </View>
            <View style={styles.itemRightPart}>
              <Text style={{
                flex:1,
                color:'#666'
              }}>message</Text>
              <Text style={{
                width:40,
                color:'#666'
              }}>tips</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    paddingLeft: 0,
    paddingRight: 10,
    flex: 1,
    flexDirection: 'row',
    height: 80,
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
  },
  itemLeft: {
    width: 90,
    height: 79,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRight: {
    flex: 1,
    height: 79,
  },
  itemRightPart: {
    flexDirection: 'row',
    marginTop: 10,
  }
})