import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import { Toast, Badge, Popover, Icon } from 'antd-mobile';
import _ from 'lodash';
import MessageItem from './Item';
import SearchInput from '../../components/SearchInput';
import api from '../../model/api';
import ep from '../../store'

export default class MessageList extends Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: '消息',
    tabBarLabel: '消息',
    headerLeft: null,
    headerRight: (
      <Popover
        overlayStyle={{
          width: 100,
          top: 40,
        }}
        overlay={[
          (
            <Popover.Item key="5" value="special">
              <TouchableHighlight
                onPress={() => {navigation.navigate('Login')}}
                underlayColor='#fff'
              >
                <Text>创建群</Text>
              </TouchableHighlight>
            </Popover.Item>
          ),
        ]}
      >
        <View style={{
          marginTop: 10,
          marginRight: 10,
          display: 'flex',
          alignItems: 'center',
        }}
        >
          <Icon type="ellipsis"/>
        </View>
      </Popover>
    ),
    tabBarIcon: ({ focused }) => {
      return focused ? <View style={{width: 30, height: 30}}>
        <Badge text={''}>
          <Image
            source={require('../../asset/message_fill.png')}
            style={{width: 30, height: 30}}
          />
        </Badge>
      </View> : <Image
        source={require('../../asset/message.png')}
        style={{width: 30, height: 30}}
      /> 
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      rooms: []
    }
  }

  componentWillMount() {
    this.listenMessage()
    this.getLocalStorage()
    this.getUserInfo(this.fetchMessage)
    ep.on('update', this.handleFocusChanged)
  }

  listenMessage = () => {
    api.listernMessage((data) => {
      storage.load({
        key: 'rooms'
      }).then(ret => {
        const newRooms = _.cloneDeep(ret);
        let createRoom = true
        newRooms.map(d => {
          if(d.roomId === data.roomId) {
            createRoom = false
            d.newMessageNum = (d.newMessageNum || 0) + 1
            d.messages.push({
              createTime: data.createTime,
              content: data.content
            })
          }
        })
        if (createRoom) {
          newRooms.unshift({
            roomId: data.roomId,
            otherSideName: data.otherSideName,
            newMessageNum: 1,
            messages: [
              {
                createTime: data.createTime,
                content: data.content
              }
            ]
          })
        }
        storage.save({
          key: 'rooms',
          data: newRooms
        }).then(d => {
          ep.emit('update')
        })
      })
    })
  }

  handleFocusChanged = () => {
    this.getLocalStorage()    
  }

  getLocalStorage = () => {
    storage.load({
      key: 'rooms'
    }).then(ret => {
      this.setState({
        rooms: ret || []
      })
    }).catch(err => {
      console.log(err.message);
    })
  }

  getUserInfo = (cb) => {
    storage.getBatchData([
      { key: 'userInfo' },
      { key: 'lastUpdateTime' }
    ]).then(results => {
      cb(results[0].userId, results[1])
    }).catch(err => {
      console.log(err.message);
    })
  }

  fetchMessage = (userId, lastUpdateTime) => {
    // 上线
    api.userOnline({
      userId
    })
    // 拉取消息
    api.getMessage({
      userId,
      lastUpdateTime
    })
    .then(({data}) => {
      if (data && data.code === 0) {
        this.updateList(userId, data)
      } else {
        Toast.info('拉取信息失败', 1);
      }
    })
  }

  updateList = (userId, data) => {
    const newRooms = _.cloneDeep(this.state.rooms)
    
    const newData = data.data.filter(d => d.messageFromId !== userId)
    const remoteRooms = {}

    newData.map((d) => {
      let createRoom = true
      newRooms.forEach((e) => {
        if (d.messageToId === e.roomId) {
          createRoom = false;
          e.newMessageNum = (e.newMessageNum || 0) + 1;
          e.messages.push({
            content: d.messageContent,
            createTime: d.createTime
          })
        }
      })
      if(createRoom) {
        newRooms.push({
          roomId: d.messageToId,
          otherSideName: d.user.userName,
          newMessageNum: 1,
          messages: [{
            content: d.messageContent,
            createTime: d.createTime
          }]
        })
      }
    })
    // 存储更新时间
    storage.save({
      key: 'lastUpdateTime',
      data: Date.parse(new Date())
    })
    storage.save({
      key: 'rooms',
      data: newRooms,
    }).then(d => {ep.emit('update')});
  }

  render() {
    const { rooms } = this.state
    return (
      <View style={styles.container}>
        <ScrollView>
          <SearchInput />
          {rooms.map((d,i) => (
            <MessageItem
              key={d.roomId || i}
              roomId={d.roomId}
              newMessageNum={d.newMessageNum}
              otherSideName={d.otherSideName}
              message={d.messages ? d.messages[d.messages.length - 1] : []}
              navigation={this.props.navigation}/>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})