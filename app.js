import express from 'express';
import logger from 'morgan';
import { createServer } from 'http';
import cookieParser from "cookie-parser";
import path from 'path';
import dotenv from 'dotenv';
import setUpSocketIO from './socket.js';
import registerRoutes from './routes/index.js';
import attachUserInfo from './middlewares/attachUserInfo.js';
import checkSuspended from './middlewares/checkSuspended.js';
import attachReqUrl from './middlewares/attachReqUrl.js';
import attachContext from './middlewares/attachContext.js';
import attachPrivilegeLevel from './middlewares/attachPrivilegeLevels.js';
import { catchError, handleError } from './middlewares/error.js';

const app = express();
const __dirname = path.resolve();
const server = createServer(app);
const io = setUpSocketIO(server);
dotenv.config();

app.locals.basedir = __dirname;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/shared', express.static(path.join(__dirname, 'shared')));
const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24,
  httpOnly: true,
  sameSite: 'strict',
};
app.use(cookieParser(cookieOptions));
app.use(attachUserInfo);
app.use(checkSuspended);
app.use(attachReqUrl);
app.use(attachContext);
app.use(attachPrivilegeLevel);

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Register routes
registerRoutes(app);

app.use(catchError);
app.use(handleError);

export { server, io, app };