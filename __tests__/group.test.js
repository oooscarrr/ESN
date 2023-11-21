import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { GroupMessage } from '../models/GroupMessage';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import { calculate_distance, get_nearby_people, get_nearby_groups, list_nearby_people } from '../controllers/nearbyPeopleController.js';
import { create_new_group, list_group_chat_list, list_group_chat_room, post_group_message, join_group, change_group_name, change_group_description, leave_group } from '../controllers/groupChatController.js';
import jwt from 'jsonwebtoken';


